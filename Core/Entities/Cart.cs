using System.Collections.Generic;

namespace Core.Entities
{
    public class Cart
    {
        public string UserId { get; set; }
        public List<CartItem> Items { get; set; } = new();
    }
}