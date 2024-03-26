export const formatTime = (time) => {
    const date = new Date(time);

    // Get date, hours, and minutes
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const namedMonths = {
        1: 'Jan',
        2: 'Feb',
        3: 'Mar',
        4: 'Apr',
        5: 'May',
        6: 'Jun',
        7: 'Jul',
        8: 'Aug',
        9: 'Sep',
        10: 'Oct',
        11: 'Nov',
        12: 'Dec'
    };

    let formatedMonth
    if (month[0] === "0") {
        formatedMonth = month.slice(1, 2)
    } else {
        formatedMonth = month
    }


    // Format the date string
    const formattedDate = `${year}-${namedMonths[formatedMonth]}-${day}`;
    const formattedTime = `${hours}:${minutes}`;

    return { date: formattedDate, time: formattedTime }
}