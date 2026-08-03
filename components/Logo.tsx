import Image from "next/image";

export default function Logo({
  variant = "claro",
  size = "md",
  layout = "horizontal",
}: {
  variant?: "claro" | "oscuro";
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
}) {
  const dims = { sm: 30, md: 38, lg: 64 }[size];
  const nombreSize = { sm: "text-base", md: "text-lg", lg: "text-3xl" }[size];
  const taglineSize = { sm: "hidden", md: "text-[9px]", lg: "text-xs" }[size];

  return (
    <div className={`flex ${layout === "vertical" ? "flex-col items-center text-center" : "items-center"} gap-2.5`}>
      <div
        className={`shrink-0 rounded-2xl flex items-center justify-center ${
          variant === "oscuro" ? "bg-white/95" : "bg-white"
        } shadow-glass`}
        style={{ width: dims + 14, height: dims + 14 }}
      >
        <Image
          src="/brand/espacio-clave-mark.png"
          alt="Espacio Clave"
          width={dims}
          height={dims}
          className="object-contain"
          priority
        />
      </div>
      <div className={layout === "vertical" ? "leading-tight mt-1" : "leading-tight"}>
        <p className={`font-display font-extrabold ${nombreSize}`}>
          <span className="text-coral">Espacio</span>{" "}
          <span className={variant === "oscuro" ? "text-white" : "text-tinta"}>Clave</span>
        </p>
        <p
          className={`${taglineSize} font-medium tracking-wide ${
            variant === "oscuro" ? "text-white/50" : "text-tinta-faint"
          }`}
        >
          Tu bienestar, nuestra clave
        </p>
      </div>
    </div>
  );
}
