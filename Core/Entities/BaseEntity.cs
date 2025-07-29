namespace Core.Entities;

public class BaseEntity
{
    //avoid the need to manually specify the Id property when used in other classes
    public int Id { get; set; }
}