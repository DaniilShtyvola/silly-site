export function formatTime(dateInput: Date | string, showTodayLabel: boolean = false): string {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const now = new Date();

    const formatHHMM = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const isToday = (d: Date) =>
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

    const isYesterday = (d: Date) => {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return (
            d.getDate() === yesterday.getDate() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getFullYear() === yesterday.getFullYear()
        );
    };

    if (isToday(date)) {
        return showTodayLabel
            ? `Today at ${formatHHMM(date)}`
            : formatHHMM(date);
    } else if (isYesterday(date)) {
        return `Yesterday at ${formatHHMM(date)}`;
    } else {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year} ${formatHHMM(date)}`;
    }
}

export function formatTimeDiff(startInput: Date | string, endInput: Date | string): string {
    const start = typeof startInput === "string" ? new Date(startInput) : startInput;
    const end = typeof endInput === "string" ? new Date(endInput) : endInput;

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);

    if (diffHrs > 0) {
        const remainingMin = diffMin % 60;
        return `${diffHrs}h${remainingMin > 0 ? ` ${remainingMin}m` : ""}`;
    } else if (diffMin > 0) {
        return `${diffMin} min`;
    } else {
        return `${diffSec} sec`;
    }
}

export function formatTimeAgo(dateInput: Date | string): string {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) {
        return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
    } else if (diffHrs > 0) {
        return `${diffHrs} hour${diffHrs === 1 ? "" : "s"}`;
    } else {
        return `${diffMin} minute${diffMin === 1 ? "" : "s"}`;
    }
}