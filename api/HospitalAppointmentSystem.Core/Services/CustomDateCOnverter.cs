using System;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

public class CustomDateTimeConverter : JsonConverter<DateTime>
{
    private const string Format = "ddd MMM dd yyyy HH:mm:ss 'GMT'zzz";

    public override DateTime Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options)
    {
        try
        {
            var dateString = reader.GetString();
            if (DateTime.TryParseExact(
                dateString,
                Format,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var date))
            {
                return date;
            }

            // Fallback to ISO 8601 if custom format fails
            if (DateTime.TryParse(dateString, out date))
            {
                return date;
            }

            throw new JsonException($"Invalid date format. Expected '{Format}' or ISO 8601.");
        }
        catch (Exception ex)
        {
            throw new JsonException("Failed to parse date", ex);
        }
    }

    public override void Write(
        Utf8JsonWriter writer,
        DateTime value,
        JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("o")); // Always write as ISO 8601
    }
}