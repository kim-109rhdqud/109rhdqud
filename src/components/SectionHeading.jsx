import { MockTag } from "./MockTag";

export function SectionHeading({ title, mock = false }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="w-1 h-5 rounded-full brand-gradient" />
      <h2 className="font-serif-kr text-xl">{title}</h2>
      {mock && <MockTag />}
    </div>
  );
}
