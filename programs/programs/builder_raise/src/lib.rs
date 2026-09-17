use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

declare_id!("6weAy9KBNBf6MFsiA4csnEj5yJEhLV5nA5fzvnHD6wS2");

/// Scale for acc_per_share so deposits split cleanly across minted shares.
pub const ACC_SCALE: u128 = 1_000_000_000;
pub const BPS_DENOM: u64 = 10_000;
pub const MAX_SHARES: u32 = 10_000;

#[program]
pub mod builder_raise {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        oracle: Pubkey,
        platform_fee_bps: u16,
        platform_treasury: Pubkey,
    ) -> Result<()> {
        require!(platform_fee_bps <= 1_000, ErrorCode::InvalidBps);
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.oracle = oracle;
        config.platform_fee_bps = platform_fee_bps;
        config.platform_treasury = platform_treasury;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn create_raise(
        ctx: Context<CreateRaise>,
        project_seed: [u8; 32],
        price_lamports: u64,
        share_supply: u32,
        holder_pool_bps: u16,
        goal_lamports: u64,
        min_builder_score: u16,
        application_hash: [u8; 32],
    ) -> Result<()> {
        require!(price_lamports > 0, ErrorCode::InvalidPrice);
        require!(
            share_supply > 0 && share_supply <= MAX_SHARES,
            ErrorCode::InvalidSupply
        );
        require!(
            holder_pool_bps > 0 && holder_pool_bps <= 10_000,
            ErrorCode::InvalidBps
        );

        let raise = &mut ctx.accounts.raise;
        raise.founder = ctx.accounts.founder.key();
        raise.project_seed = project_seed;
        raise.status = RaiseStatus::Draft;
        raise.price_lamports = price_lamports;
        raise.share_supply = share_supply;
        raise.shares_minted = 0;
        raise.holder_pool_bps = holder_pool_bps;
        raise.founder_retained_bps = 10_000 - holder_pool_bps;
        raise.goal_lamports = goal_lamports;
        raise.raised_lamports = 0;
        raise.acc_per_share = 0;
        raise.vault_bump = ctx.bumps.vault;
        raise.min_builder_score = min_builder_score;
        raise.application_hash = application_hash;
        raise.collection = raise.key();
        raise.bump = ctx.bumps.raise;

        let vault = &mut ctx.accounts.vault;
        vault.bump = ctx.bumps.vault;
        Ok(())
    }

    pub fn open_raise(ctx: Context<OpenRaise>) -> Result<()> {
        require!(
            ctx.accounts.oracle.key() == ctx.accounts.config.oracle,
            ErrorCode::UnauthorizedOracle
        );
        require!(
            ctx.accounts.raise.status == RaiseStatus::Draft,
            ErrorCode::InvalidStatus
        );
        ctx.accounts.raise.status = RaiseStatus::Live;
        Ok(())
    }

    pub fn mint_share(ctx: Context<MintShare>, serial: u32) -> Result<()> {
        let raise = &mut ctx.accounts.raise;
        require!(raise.status == RaiseStatus::Live, ErrorCode::RaiseNotLive);
        require!(raise.shares_minted < raise.share_supply, ErrorCode::SoldOut);
        require!(serial == raise.shares_minted, ErrorCode::InvalidSerial);

        let price = raise.price_lamports;
        let fee_bps = ctx.accounts.config.platform_fee_bps as u64;
        let fee = price
            .checked_mul(fee_bps)
            .and_then(|v| v.checked_div(BPS_DENOM))
            .ok_or(ErrorCode::MathOverflow)?;
        let to_founder = price.checked_sub(fee).ok_or(ErrorCode::MathOverflow)?;

        if fee > 0 && ctx.accounts.buyer.key() != ctx.accounts.platform_treasury.key() {
            system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.buyer.to_account_info(),
                        to: ctx.accounts.platform_treasury.to_account_info(),
                    },
                ),
                fee,
            )?;
        }

        if to_founder > 0 && ctx.accounts.buyer.key() != ctx.accounts.founder.key() {
            system_program::transfer(
                CpiContext::new(
                    ctx.accounts.system_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.buyer.to_account_info(),
                        to: ctx.accounts.founder.to_account_info(),
                    },
                ),
                to_founder,
            )?;
        }

        let cert = &mut ctx.accounts.certificate;
        cert.raise = raise.key();
        cert.owner = ctx.accounts.buyer.key();
        cert.serial = serial;
        cert.last_acc = raise.acc_per_share;
        cert.bump = ctx.bumps.certificate;

        raise.shares_minted = raise
            .shares_minted
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;
        raise.raised_lamports = raise
            .raised_lamports
            .checked_add(price)
            .ok_or(ErrorCode::MathOverflow)?;

        if raise.shares_minted == raise.share_supply {
            raise.status = RaiseStatus::Filled;
        }
        Ok(())
    }

    pub fn deposit_win(ctx: Context<DepositWin>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        let raise = &mut ctx.accounts.raise;
        require!(
            raise.status == RaiseStatus::Live
                || raise.status == RaiseStatus::Filled
                || raise.status == RaiseStatus::Closed,
            ErrorCode::InvalidStatus
        );
        require!(raise.shares_minted > 0, ErrorCode::NoSharesMinted);
        require!(
            ctx.accounts.founder.key() == raise.founder,
            ErrorCode::UnauthorizedFounder
        );

        let holder_amount = amount
            .checked_mul(raise.holder_pool_bps as u64)
            .and_then(|v| v.checked_div(BPS_DENOM))
            .ok_or(ErrorCode::MathOverflow)?;
        let founder_keep = amount
            .checked_sub(holder_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.founder.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;

        if founder_keep > 0 {
            let raise_key = raise.key();
            let seeds = &[
                b"vault".as_ref(),
                raise_key.as_ref(),
                &[raise.vault_bump],
            ];
            system_program::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.system_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.founder.to_account_info(),
                    },
                    &[seeds],
                ),
                founder_keep,
            )?;
        }

        let delta = (holder_amount as u128)
            .checked_mul(ACC_SCALE)
            .and_then(|v| v.checked_div(raise.shares_minted as u128))
            .ok_or(ErrorCode::MathOverflow)?;
        raise.acc_per_share = raise
            .acc_per_share
            .checked_add(delta)
            .ok_or(ErrorCode::MathOverflow)?;
        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let cert = &mut ctx.accounts.certificate;
        let raise = &ctx.accounts.raise;
        require!(cert.owner == ctx.accounts.owner.key(), ErrorCode::UnauthorizedOwner);
        require!(cert.raise == raise.key(), ErrorCode::CertificateMismatch);

        let owed_scaled = raise
            .acc_per_share
            .checked_sub(cert.last_acc)
            .ok_or(ErrorCode::MathOverflow)?;
        let owed = u64::try_from(owed_scaled / ACC_SCALE).map_err(|_| ErrorCode::MathOverflow)?;
        require!(owed > 0, ErrorCode::NothingToClaim);

        let min_rent = Rent::get()?.minimum_balance(8 + RaiseVault::INIT_SPACE);
        let available = ctx
            .accounts
            .vault
            .to_account_info()
            .lamports()
            .saturating_sub(min_rent);
        require!(owed <= available, ErrorCode::InsufficientVault);

        let raise_key = raise.key();
        let seeds = &[b"vault".as_ref(), raise_key.as_ref(), &[raise.vault_bump]];
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.owner.to_account_info(),
                },
                &[seeds],
            ),
            owed,
        )?;

        cert.last_acc = raise.acc_per_share;
        Ok(())
    }

    pub fn close_raise(ctx: Context<CloseRaise>) -> Result<()> {
        require!(
            ctx.accounts.founder.key() == ctx.accounts.raise.founder,
            ErrorCode::UnauthorizedFounder
        );
        require!(
            ctx.accounts.raise.status == RaiseStatus::Live
                || ctx.accounts.raise.status == RaiseStatus::Filled,
            ErrorCode::InvalidStatus
        );
        if ctx.accounts.raise.status == RaiseStatus::Live {
            ctx.accounts.raise.status = RaiseStatus::Closed;
        }
        Ok(())
    }

    pub fn cancel_raise(ctx: Context<CancelRaise>) -> Result<()> {
        require!(
            ctx.accounts.founder.key() == ctx.accounts.raise.founder,
            ErrorCode::UnauthorizedFounder
        );
        require!(
            ctx.accounts.raise.status == RaiseStatus::Draft
                || ctx.accounts.raise.status == RaiseStatus::Live,
            ErrorCode::InvalidStatus
        );
        require!(ctx.accounts.raise.shares_minted == 0, ErrorCode::SharesOutstanding);
        ctx.accounts.raise.status = RaiseStatus::Cancelled;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + RaiseConfig::INIT_SPACE,
        seeds = [b"raise-config"],
        bump
    )]
    pub config: Account<'info, RaiseConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(project_seed: [u8; 32])]
pub struct CreateRaise<'info> {
    #[account(
        init,
        payer = founder,
        space = 8 + Raise::INIT_SPACE,
        seeds = [b"raise", founder.key().as_ref(), project_seed.as_ref()],
        bump
    )]
    pub raise: Account<'info, Raise>,
    #[account(
        init,
        payer = founder,
        space = 8 + RaiseVault::INIT_SPACE,
        seeds = [b"vault", raise.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, RaiseVault>,
    #[account(mut)]
    pub founder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OpenRaise<'info> {
    #[account(
        mut,
        seeds = [b"raise", raise.founder.as_ref(), raise.project_seed.as_ref()],
        bump = raise.bump
    )]
    pub raise: Account<'info, Raise>,
    #[account(seeds = [b"raise-config"], bump = config.bump)]
    pub config: Account<'info, RaiseConfig>,
    pub oracle: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(serial: u32)]
pub struct MintShare<'info> {
    #[account(
        mut,
        seeds = [b"raise", raise.founder.as_ref(), raise.project_seed.as_ref()],
        bump = raise.bump
    )]
    pub raise: Account<'info, Raise>,
    #[account(seeds = [b"raise-config"], bump = config.bump)]
    pub config: Account<'info, RaiseConfig>,
    #[account(
        init,
        payer = buyer,
        space = 8 + ShareCertificate::INIT_SPACE,
        seeds = [b"share", raise.key().as_ref(), &serial.to_le_bytes()],
        bump
    )]
    pub certificate: Account<'info, ShareCertificate>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: founder receives mint proceeds
    #[account(mut, address = raise.founder)]
    pub founder: UncheckedAccount<'info>,
    /// CHECK: platform fee sink
    #[account(mut, address = config.platform_treasury)]
    pub platform_treasury: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositWin<'info> {
    #[account(
        mut,
        seeds = [b"raise", raise.founder.as_ref(), raise.project_seed.as_ref()],
        bump = raise.bump
    )]
    pub raise: Account<'info, Raise>,
    #[account(
        mut,
        seeds = [b"vault", raise.key().as_ref()],
        bump = raise.vault_bump
    )]
    pub vault: Account<'info, RaiseVault>,
    #[account(mut)]
    pub founder: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        seeds = [b"raise", raise.founder.as_ref(), raise.project_seed.as_ref()],
        bump = raise.bump
    )]
    pub raise: Account<'info, Raise>,
    #[account(
        mut,
        seeds = [b"share", raise.key().as_ref(), &certificate.serial.to_le_bytes()],
        bump = certificate.bump
    )]
    pub certificate: Account<'info, ShareCertificate>,
    #[account(
        mut,
        seeds = [b"vault", raise.key().as_ref()],
        bump = raise.vault_bump
    )]
    pub vault: Account<'info, RaiseVault>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseRaise<'info> {
    #[account(
        mut,
        seeds = [b"raise", raise.founder.as_ref(), raise.project_seed.as_ref()],
        bump = raise.bump
    )]
    pub raise: Account<'info, Raise>,
    pub founder: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelRaise<'info> {
    #[account(
        mut,
        seeds = [b"raise", raise.founder.as_ref(), raise.project_seed.as_ref()],
        bump = raise.bump
    )]
    pub raise: Account<'info, Raise>,
    pub founder: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct RaiseConfig {
    pub authority: Pubkey,
    pub oracle: Pubkey,
    pub platform_fee_bps: u16,
    pub platform_treasury: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Raise {
    pub founder: Pubkey,
    pub project_seed: [u8; 32],
    pub status: RaiseStatus,
    pub price_lamports: u64,
    pub share_supply: u32,
    pub shares_minted: u32,
    pub holder_pool_bps: u16,
    pub founder_retained_bps: u16,
    pub goal_lamports: u64,
    pub raised_lamports: u64,
    pub acc_per_share: u128,
    pub vault_bump: u8,
    pub min_builder_score: u16,
    pub application_hash: [u8; 32],
    pub collection: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct RaiseVault {
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ShareCertificate {
    pub raise: Pubkey,
    pub owner: Pubkey,
    pub serial: u32,
    pub last_acc: u128,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum RaiseStatus {
    Draft,
    Live,
    Filled,
    Closed,
    Cancelled,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: only the raise oracle can open a raise")]
    UnauthorizedOracle,
    #[msg("Unauthorized: only the founder can do this")]
    UnauthorizedFounder,
    #[msg("Unauthorized: only the certificate owner can claim")]
    UnauthorizedOwner,
    #[msg("Raise is not live")]
    RaiseNotLive,
    #[msg("Invalid raise status for this instruction")]
    InvalidStatus,
    #[msg("Share supply is sold out")]
    SoldOut,
    #[msg("Serial must equal the next minted index")]
    InvalidSerial,
    #[msg("Price must be greater than zero")]
    InvalidPrice,
    #[msg("Share supply out of bounds")]
    InvalidSupply,
    #[msg("BPS out of bounds")]
    InvalidBps,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Cannot deposit until at least one share is minted")]
    NoSharesMinted,
    #[msg("Certificate does not belong to this raise")]
    CertificateMismatch,
    #[msg("Nothing to claim")]
    NothingToClaim,
    #[msg("Vault has insufficient claimable lamports")]
    InsufficientVault,
    #[msg("Cannot cancel while shares are outstanding")]
    SharesOutstanding,
    #[msg("Arithmetic overflow")]
    MathOverflow,
}
