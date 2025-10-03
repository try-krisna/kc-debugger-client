
import { useState, useEffect, useRef } from "react"; 
import {
  Box,
  Button,
  VStack,
  Text,
  HStack,
  NumberInput,
  NumberInputField,
  FormLabel,
  useToast,
} from "@chakra-ui/react";

export default function TokenViewer({
  tokens,
  setTokens,
  config,
  fetchProfile,
  onLogout,
}) {
  const [accessCountdown, setAccessCountdown] = useState(0);
  const [refreshCountdown, setRefreshCountdown] = useState(0);
  const [autoRefreshMinutes, setAutoRefreshMinutes] = useState(0);
  const autoRefreshTimerRef = useRef(null);
  const accessIntervalRef = useRef(null);
  const refreshIntervalRef = useRef(null);
     const toast = useToast()

  // Convert seconds to hh:mm:ss
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Initialize countdowns whenever tokens change
  useEffect(() => {
    if (!tokens) return;

    // Reset countdowns
    setAccessCountdown(tokens.expires_in || 0);
    setRefreshCountdown(tokens.refresh_expires_in || 0);

    // Clear previous intervals
    if (accessIntervalRef.current) clearInterval(accessIntervalRef.current);
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);

    // Access token countdown
    accessIntervalRef.current = setInterval(() => {
      setAccessCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(accessIntervalRef.current);
          
          // alert("Access token expired. Logging out...");
           toast({
          title: "Expired 🎉",
          description: "Access token expired. Logging out...",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
          // onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Refresh token countdown
    refreshIntervalRef.current = setInterval(() => {
      setRefreshCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(accessIntervalRef.current);
      clearInterval(refreshIntervalRef.current);
    };
  }, [tokens, onLogout]);

  // Manual refresh
  const refreshToken = async () => {
    if (!tokens?.refresh_token) return;

    const tokenUrl = `${config.url}/realms/${config.realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: config.clientId,
      refresh_token: tokens.refresh_token,
    });

    try {
      const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const data = await res.json();
      console.log("===> Done Refresh Token:",data)

      if (data.error) throw new Error(data.error_description);

      setTokens(data);
      localStorage.setItem("kc_tokens", JSON.stringify(data));
      if (data.access_token) fetchProfile(data.access_token);
          toast({
          title: "Success 🎉",
          description: "Token refreshed successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      // alert("Token refreshed successfully!");

    } catch (err) {
      console.error(err);
      alert("Failed to refresh token: " + err.message);
      // onLogout();
    }
  };

  // Auto refresh
  const startAutoRefresh = () => {
    if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);

    const intervalMs = autoRefreshMinutes * 60 * 1000;
    const timer = setInterval(() => {
      refreshToken();
    }, intervalMs);

    autoRefreshTimerRef.current = timer;
    alert(`Auto refresh started every ${autoRefreshMinutes} minute(s)`);
  };

  const stopAutoRefresh = () => {
    if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
    autoRefreshTimerRef.current = null;
    alert("Auto refresh stopped");
  };

  // Test access token validity
  const testAccessToken = async () => {
    if (!tokens?.access_token) return alert("No access token");

    try {
      const res = await fetch(
        `${config.url}/realms/${config.realm}/protocol/openid-connect/userinfo`,
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        // alert(
        //   "Access token is valid. User info:\n" + JSON.stringify(data, null, 2)
        // );
            toast({
              position: "top",
          title: "Success 🎉",
          description:"Access token is valid. User info:\n" + JSON.stringify(data, null, 2),
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
         toast({
              position: "top",
          title: "Faild",
          description:"Access token is invalid or expired. Status: " + res.status,
          status: "error",
          duration: 3000,
          isClosable: true,
        })
        // alert(
        //   "Access token is invalid or expired. Status: " + res.status
        // );
        // onLogout();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to verify access token: " + err.message);
      // onLogout();
    }
  };

  if (!tokens) return null;

  return (
    <Box p={4} borderWidth="1px" rounded="lg" shadow="sm">
      <VStack spacing={3} align="stretch">
        <Text>
          Access token expires in: <b>{formatTime(accessCountdown)}</b>
        </Text>
        <Text>
          Refresh token expires in: <b>{formatTime(refreshCountdown)}</b>
        </Text>

        <HStack spacing={3}>
          <Button colorScheme="blue" size="sm" onClick={refreshToken}>
            Refresh Token Manually
          </Button>
          <Button colorScheme="purple" size="sm" onClick={testAccessToken}>
            Test Access Token
          </Button>
        </HStack>

        <Box>
          <FormLabel>Auto refresh interval (minutes)</FormLabel>
          <HStack>
            <NumberInput
              size="sm"
              min={1}
              value={autoRefreshMinutes}
              onChange={(valueString) =>
                setAutoRefreshMinutes(Number(valueString))
              }
            >
              <NumberInputField />
            </NumberInput>
            <Button size="sm" colorScheme="green" onClick={startAutoRefresh}>
              Start Auto Refresh
            </Button>
            <Button size="sm" colorScheme="red" onClick={stopAutoRefresh}>
              Stop Auto Refresh
            </Button>
          </HStack>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">
            Note: You will be automatically logged out when access token expires.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}