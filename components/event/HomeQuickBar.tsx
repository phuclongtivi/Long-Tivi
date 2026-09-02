"use client";

export type HomeQuickFilter = "all" | "hot" | "guest" | "famous";

function Ico({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const BTN: { id: HomeQuickFilter | "create" | "cam" | "rap"; label: string; d: string }[] = [
  { id: "create", label: "Thông báo", d: "M12 5v4M8 8h8M6 19h12a2 2 0 0 0 2-2v-5a8 8 0 1 0-16 0v5a2 2 0 0 0 2 2z" },
  { id: "hot", label: "Hot Live", d: "M12 3s4 4 4 8a4 4 0 1 1-8 0c0-2 2-4 4-8zM9 17h6" },
  { id: "guest", label: "Khách mời", d: "M16 19v-1a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v1M10.5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 8v4M21 10h-4" },
  { id: "famous", label: "Người nổi tiếng", d: "M12 3.6 14.2 9h5.6l-4.5 3.4 1.7 5.4L12 14.8 6.9 17.8l1.8-5.4L4.2 9h5.6z" },
  { id: "cam", label: "Video ảnh", d: "M4 8.5h11.5A1.5 1.5 0 0 1 17 10v7.5A1.5 1.5 0 0 1 15.5 19H4.5A1.5 1.5 0 0 1 3 17.5V10A1.5 1.5 0 0 1 4.5 8.5zM17 11.5l4-2.2v7.4l-4-2.2z" },
  { id: "rap", label: "Vào Rạp", d: "M4 6h16v12H4zM8 6v12M16 6v12M4 12h16" },
];

export function HomeQuickBar({
  filter,
  onFilter,
  onCreate,
  onCam,
  onRap,
}: {
  filter: HomeQuickFilter;
  onFilter: (f: HomeQuickFilter) => void;
  onCreate: () => void;
  onCam: () => void;
  onRap: () => void;
}) {
  return (
    <div className="pl-quickbar">
      {BTN.map((b) => {
        const on = b.id === filter;
        return (
          <div key={b.id} className={on ? "pl-tool-tab on" : "pl-tool-tab"}>
            <button
              type="button"
              className="pl-tool-tab-inner"
              onClick={() => {
                if (b.id === "create") onCreate();
                else if (b.id === "cam") onCam();
                else if (b.id === "rap") onRap();
                else onFilter(on ? "all" : b.id);
              }}
            >
              <Ico d={b.d} />
              <span>{b.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
