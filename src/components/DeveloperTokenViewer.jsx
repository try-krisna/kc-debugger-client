import { Box, Heading, Code, VStack } from "@chakra-ui/react";

function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

export default function DeveloperTokenViewer({ tokens }) {
  if (!tokens) return null;

  const accessDecoded = tokens.access_token ? decodeJwt(tokens.access_token) : null;
  const idDecoded = tokens.id_token ? decodeJwt(tokens.id_token) : null;

  return (
    <Box p={4} borderWidth="1px" rounded="lg" shadow="sm" mt={4}>
      <Heading size="md" mb={4}>🔑 Tokens</Heading>
      <VStack align="stretch" spacing={6}>
        
        {/* Access Token */}
        {tokens.access_token && (
          <Box>
            <Heading size="sm" mb={2}>Access Token (raw)</Heading>
            <Code
              p={3}
              w="100%"
              whiteSpace="pre-wrap"
              overflowWrap="anywhere"
              display="block"
              fontSize="xs"
            >
              {tokens.access_token}
            </Code>

            <Heading size="sm" mt={3} mb={2}>Access Token (decoded)</Heading>
            <Code
              p={3}
              w="100%"
              whiteSpace="pre-wrap"
              display="block"
              fontSize="xs"
            >
              {JSON.stringify(accessDecoded, null, 2)}
            </Code>
          </Box>
        )}

        {/* ID Token */}
        {tokens.id_token && (
          <Box>
            <Heading size="sm" mb={2}>ID Token (raw)</Heading>
            <Code
              p={3}
              w="100%"
              whiteSpace="pre-wrap"
              overflowWrap="anywhere"
              display="block"
              fontSize="xs"
            >
              {tokens.id_token}
            </Code>

            <Heading size="sm" mt={3} mb={2}>ID Token (decoded)</Heading>
            <Code
              p={3}
              w="100%"
              whiteSpace="pre-wrap"
              display="block"
              fontSize="xs"
            >
              {JSON.stringify(idDecoded, null, 2)}
            </Code>
          </Box>
        )}

        {/* Refresh Token */}
        {tokens.refresh_token && (
          <Box>
            <Heading size="sm" mb={2}>Refresh Token (raw)</Heading>
            <Code
              p={3}
              w="100%"
              whiteSpace="pre-wrap"
              overflowWrap="anywhere"
              display="block"
              fontSize="xs"
            >
              {tokens.refresh_token}
            </Code>
          </Box>
        )}

      </VStack>
    </Box>
  );
}
