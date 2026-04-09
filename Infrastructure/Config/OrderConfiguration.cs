using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Core.Entities;

namespace Infrastructure.Config;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
        builder.Property(x => x.ShippingCost).HasColumnType("decimal(18,2)");
        builder.Property(x => x.TaxAmount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Discount).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Total).HasColumnType("decimal(18,2)");
    }
}
