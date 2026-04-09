using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Core.Entities;

namespace Infrastructure.Config;

public class CouponCodeConfiguration : IEntityTypeConfiguration<CouponCode>
{
    public void Configure(EntityTypeBuilder<CouponCode> builder)
    {
        builder.Property(x => x.DiscountPercent).HasColumnType("decimal(18,2)");
    }
}
