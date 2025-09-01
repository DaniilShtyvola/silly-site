using static System.Ulid;

public static class ShortUlid
{
    public static string NewId()
    {
        var full = Ulid.NewUlid().ToString();
        return full.Substring(0, 18);
    }
}