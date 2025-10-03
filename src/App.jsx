import { useState, useEffect } from "react";
import { generateCodeVerifier, pkceChallenge } from "./utils/pkce";
import {
  Container,
  VStack,
  Heading,
  ChakraProvider,
  Flex,
  Spacer,
  Button,
  Box,
  Divider,
} from "@chakra-ui/react";
import ConfigModal from "./components/ConfigModal";
import TokenViewer from "./components/TokenViewer";
import ProfileViewer from "./components/ProfileViewer";
import DeveloperTokenViewer from "./components/DeveloperTokenViewer"; 
import { DEFAULT_CONFIG } from "./utils/kc-default-config";

// const defaultConfig = {
//   url: "https://redhat-dev.sso.gov.kh",
//   realm: "krisna",
//   clientId: "test-web",
//   scope: "openid profile email",
//   redirectUri: window.location.origin,
// };

function App() {
  const [config, setConfig] = useState(null);
  const [accounts, setAccounts] = useState([]); // multiple accounts
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Load saved config and accounts
  useEffect(() => {
    const savedConfig = localStorage.getItem("kc_config");
    setConfig(savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG);

    const savedAccounts = localStorage.getItem("kc_accounts");
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    }
  }, []);

  // Handle redirect after login
  useEffect(() => {
    if (!config) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      console.log("🔹 Keycloak returned code:", code);
      exchangeCode(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [config]);

  // Login (for first account or adding new)
  const login = async () => {
    if (!config) return;

    const verifier = generateCodeVerifier();
    localStorage.setItem("pkce_verifier", verifier);

    const challenge = await pkceChallenge(verifier);

    const authUrl =
      `${config.url}/realms/${config.realm}/protocol/openid-connect/auth` +
      `?response_type=code&client_id=${config.clientId}` +
      `&redirect_uri=${encodeURIComponent(config.redirectUri)}` +
      `&scope=${encodeURIComponent(config.scope)}` +
      `&code_challenge=${challenge}&code_challenge_method=S256` +
      `&prompt=login`; // 🔑 force login to allow adding new account

    window.location.href = authUrl;
  };

  // Exchange code for tokens
  const exchangeCode = async (code) => {
    const verifier = localStorage.getItem("pkce_verifier");

    if (!verifier) {
      alert("PKCE verifier not found. Please login again.");
      return;
    }

    const tokenUrl = `${config.url}/realms/${config.realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      code,
      redirect_uri: config.redirectUri,
      code_verifier: verifier,
    });

    try {
      const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await res.json();

      if (data.error) {
        alert("Login failed: " + data.error_description);
        return;
      }

      console.log("✅ Tokens received:", data);

      // Fetch profile for this account
      const userUrl = `${config.url}/realms/${config.realm}/protocol/openid-connect/userinfo`;
      const userRes = await fetch(userUrl, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const user = await userRes.json();

      // Add new account
      setAccounts((prev) => {
        const updated = [...prev, { tokens: data, profile: user }];
        localStorage.setItem("kc_accounts", JSON.stringify(updated));
        return updated;
      });

      localStorage.removeItem("pkce_verifier");
    } catch (err) {
      console.error(err);
      alert("Failed to exchange code.");
    }
  };

  // Remove one account
  const removeAccount = (index) => {
    setAccounts((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem("kc_accounts", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ChakraProvider>
      <Box w="100vw" h="100vh">
        <Container
          maxW="container.md"
          py={6}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Flex mb={6} align="center" w="100%">
            <Heading size="md">🔑 Keycloak Test App</Heading>
            <Spacer />
            <Button size="sm" onClick={() => setIsConfigOpen(true)}>
              Config
            </Button>
            <Button
              size="sm"
              colorScheme="green"
              onClick={login}
              ml={2}
            >
              {accounts.length === 0 ? "Login" : "Add Account"}
            </Button>
          </Flex>

          <ConfigModal
            config={config}
            setConfig={setConfig}
            isOpen={isConfigOpen}
            onClose={() => setIsConfigOpen(false)}
          />

          {accounts.length > 0 && (
            <VStack spacing={8} align="stretch" w="100%">
              {accounts.map((acc, idx) => (
                <Box
                  key={idx}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  boxShadow="sm"
                >
                  <Heading size="sm" mb={2}>
                    Account {idx + 1}:{" "}
                    {acc.profile?.preferred_username || "Unknown"}
                  </Heading>
                  <TokenViewer
                    tokens={acc.tokens}
                    config={config}
                  />
                  <ProfileViewer profile={acc.profile} />
                  <DeveloperTokenViewer tokens={acc.tokens} />
                  <Button
                    size="sm"
                    colorScheme="red"
                    mt={3}
                    onClick={() => removeAccount(idx)}
                  >
                    Logout {acc.profile?.preferred_username || `Account ${idx+1}`}
                  </Button>
                  {idx < accounts.length - 1 && <Divider mt={4} />}
                </Box>
              ))}
            </VStack>
          )}
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;
