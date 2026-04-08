namespace Core.Entities
{
    public class CartItem
    {
        public int ProductId { get; set; }
        public required string Name { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public required string ImageUrl { get; set; }
        public int AvailableStock { get; set; }
    }
}