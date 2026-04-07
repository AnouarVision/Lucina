using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Core.Entities;

namespace Infrastructure.Config;

public class DeliveryOptionConfiguration : IEntityTypeConfiguration<DeliveryOption>
{
    public void Configure(EntityTypeBuilder<DeliveryOption> builder)
    {
        builder.Property(x => x.Price)
            .HasColumnType("decimal(18,2)");
    }
}