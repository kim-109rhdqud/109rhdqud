import { MockTag } from "./MockTag";

export function SectionHeading({ title, mock = false }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <h2 className="font-serif-kr text-xl">{title}</h2>
      {mock && <MockTag />}
    </div>
  );
}
