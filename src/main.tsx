import { createRoot } from "react-dom/client";
import "./index.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

import Root from "@/Root";

dayjs.extend(relativeTime);
dayjs.locale("es");

createRoot(document.getElementById("root")!).render(<Root />);
