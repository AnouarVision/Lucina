using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Core.Entities;

namespace Infrastructure.Config;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.PictureUrl).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Brand).IsRequired().HasMaxLength(100);
    }
}