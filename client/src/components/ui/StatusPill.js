import { STATUS_CONFIG } from '../../utils/orderStatus';

export default function StatusPill({ status, className = '' }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.drafted;
    const Icon = config.icon;
    return (
        <span className={`pill ${config.pillClass} ${className}`}>
            <Icon size={13} strokeWidth={2.5} />
            {config.label}
        </span>
    );
}