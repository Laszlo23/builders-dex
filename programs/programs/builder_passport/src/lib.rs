use anchor_lang::prelude::*;

declare_id!("7MWCkrbSxv5tsBSbSUwiH5C6iztBwe4CksjrRA7VSQnD");

#[program]
pub mod builder_passport {
    use super::*;

    /// Initialize the global Config PDA (one-time, deployer only)
    pub fn initialize_config(ctx: Context<InitializeConfig>, oracle: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.oracle = oracle;
        config.bump = ctx.bumps.config;
        
        msg!("Config initialized with oracle: {:?}", oracle);
        Ok(())
    }

    /// Update the oracle pubkey (config authority only)
    pub fn update_oracle(ctx: Context<UpdateOracle>, new_oracle: Pubkey) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.config.authority,
            ErrorCode::UnauthorizedConfigUpdate
        );
        
        ctx.accounts.config.oracle = new_oracle;
        msg!("Oracle updated to: {:?}", new_oracle);
        Ok(())
    }

    /// Initialize a new Builder Passport PDA for a wallet
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let passport = &mut ctx.accounts.passport;
        passport.authority = ctx.accounts.authority.key();
        passport.score = 0;
        passport.level = BuilderLevel::Rookie;
        passport.last_updated = Clock::get()?.unix_timestamp;
        passport.bump = ctx.bumps.passport;
        
        msg!("Builder Passport initialized for: {:?}", passport.authority);
        Ok(())
    }

    /// Update the Builder Score (oracle only)
    pub fn update_score(ctx: Context<UpdateScore>, new_score: u16) -> Result<()> {
        let passport = &mut ctx.accounts.passport;
        
        require!(
            ctx.accounts.oracle.key() == ctx.accounts.config.oracle,
            ErrorCode::UnauthorizedUpdate
        );
        
        passport.score = new_score;
        passport.level = calculate_level(new_score);
        passport.last_updated = Clock::get()?.unix_timestamp;
        
        msg!("Score updated to {} for: {:?}", new_score, passport.authority);
        Ok(())
    }

    /// Close a Builder Passport PDA (optional)
    pub fn close(ctx: Context<Close>) -> Result<()> {
        let passport = &ctx.accounts.passport;
        
        require!(
            passport.authority == ctx.accounts.authority.key(),
            ErrorCode::UnauthorizedClose
        );
        
        msg!("Builder Passport closed for: {:?}", passport.authority);
        Ok(())
    }
}

/// Calculate builder level based on score
fn calculate_level(score: u16) -> BuilderLevel {
    match score {
        0..=99 => BuilderLevel::Rookie,
        100..=249 => BuilderLevel::Builder,
        250..=499 => BuilderLevel::Advanced,
        500..=999 => BuilderLevel::Expert,
        _ => BuilderLevel::Genesis,
    }
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Config::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateOracle<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + BuilderPassport::INIT_SPACE,
        seeds = [b"builder-passport", authority.key().as_ref()],
        bump
    )]
    pub passport: Account<'info, BuilderPassport>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateScore<'info> {
    #[account(
        mut,
        seeds = [b"builder-passport", passport.authority.as_ref()],
        bump = passport.bump
    )]
    pub passport: Account<'info, BuilderPassport>,
    
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    
    /// Oracle signer (must match config.oracle)
    pub oracle: Signer<'info>,
}

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(
        mut,
        close = authority,
        seeds = [b"builder-passport", authority.key().as_ref()],
        bump = passport.bump
    )]
    pub passport: Account<'info, BuilderPassport>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Config {
    /// Program authority (can update oracle)
    pub authority: Pubkey,
    /// Oracle pubkey (can update all passport scores)
    pub oracle: Pubkey,
    /// PDA bump seed
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct BuilderPassport {
    /// The wallet that owns this passport
    pub authority: Pubkey,
    /// Builder Score (0-10000)
    pub score: u16,
    /// Builder level/tier
    pub level: BuilderLevel,
    /// Last update timestamp
    pub last_updated: i64,
    /// PDA bump seed
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum BuilderLevel {
    Rookie,      // 0-99
    Builder,     // 100-249
    Advanced,    // 250-499
    Expert,      // 500-999
    Genesis,     // 1000+
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: Only oracle can update scores")]
    UnauthorizedUpdate,
    #[msg("Unauthorized: Only passport owner can close")]
    UnauthorizedClose,
    #[msg("Unauthorized: Only config authority can update oracle")]
    UnauthorizedConfigUpdate,
}
