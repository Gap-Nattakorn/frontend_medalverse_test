import { getServerSession } from "@/shared/auth/server-session";
import { CredentialCloudFrame } from "@/components/CredentialCloudFrame";
import Image from "next/image";

export default async function CredentialCloudLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="relative h-screen w-full p-2 overflow-hidden">
      <Image
        src="/app/assets/backgrounds/bg-CredentialCloud.jpg"
        alt="Background"
        quality={100}
        fill
        sizes="100vw"
        style={{
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      
      <div className="relative z-10 h-full w-full">
        <CredentialCloudFrame userName={session.name}>
          {children}
        </CredentialCloudFrame>
      </div>
    </div>
  );
}