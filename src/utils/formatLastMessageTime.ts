function formatLastMessageTime(createdAt: string): string {
    const date = new Date(createdAt);
  
    // Get hours and minutes
    let hours: number = date.getHours();
    const minutes: number = date.getMinutes();
  
    // Determine AM/PM
    const ampm: string = hours >= 12 ? 'PM' : 'AM';
  
    // Convert 24-hour time to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
  
    // Add leading zero to minutes if needed
    const formattedMinutes: string = minutes < 10 ? '0' + minutes : minutes.toString();
  
    // Format the time as "HH:MM AM/PM"
    return `${hours}:${formattedMinutes} ${ampm}`;
  }

  export default formatLastMessageTime;
  