import { useStore } from "../context/StoreContext";
export default function StoreAnnouncement() { const { storeSettings } = useStore(); return storeSettings.announcement ? <div className="store-announcement">{storeSettings.announcement}</div> : null; }
