import Logo from "@/components/Logo";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="ec-fondo-organico min-h-screen flex items-center justify-center px-4 bg-crema">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" layout="vertical" />
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
