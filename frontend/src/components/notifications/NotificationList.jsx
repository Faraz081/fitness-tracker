import { NotificationItem } from './NotificationItem';

export function NotificationList({ items, onRead, onRemove }) {
    return (
        <div className="space-y-3">
            {items.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={onRead}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
}