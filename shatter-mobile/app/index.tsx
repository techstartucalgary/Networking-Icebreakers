import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  //wait for page to mount
  useEffect(() => {
    setReady(true);
  }, []);

  //page mounted, set base page
  useEffect(() => {
    if (!ready) return;
    router.replace("/JoinEvent");
  }, [ready, router]);

  return null;
}