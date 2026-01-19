import { Container } from "@/components/container";
import { Logo } from "@/components/logo.tsx";
import { Button } from "@/components/ui/button";

export function LoginWithPlatform() {
  async function handleRedirectToOkami() {
    await chrome.tabs.create({
      url: `${import.meta.env.VITE_OKAMI_PTATFORM_URL}/extension/auth`,
      active: true,
    });
  }

  return (
    <Container>
      <section className="flex flex-col gap-4">
        <picture className="flex justify-center">
          <Logo className="size-28" />
        </picture>
        <Button onClick={handleRedirectToOkami}>Entrar com Okami</Button>
      </section>
    </Container>
  );
}
