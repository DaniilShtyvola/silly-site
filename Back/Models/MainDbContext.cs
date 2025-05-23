﻿using Microsoft.EntityFrameworkCore;

public class MainDbContext : DbContext
{
    public MainDbContext(DbContextOptions<MainDbContext> options) : base(options) { }

    public DbSet<VisitorInfo> VisitorInfos { get; set; }
    public DbSet<Log> Logs { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Cat> Cats { get; set; }
    public DbSet<CatComment> CatComments { get; set; }
    public DbSet<CatReaction> CatReactions { get; set; }
    public DbSet<CatSocialLink> CatSocialLinks { get; set; }
    public DbSet<CatImage> CatImages { get; set; }
}