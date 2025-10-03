import { Box, Heading, Code } from "@chakra-ui/react";

export default function ProfileViewer({ profile }) {
  if (!profile) return null;

  return (
    <Box p={4} borderWidth="1px" rounded="lg" shadow="sm"  mt={4}>
      <Heading size="md" mb={3}>👤 Profile</Heading>
      <Code p={3} w="100%" whiteSpace="pre-wrap" fontSize="sm" display="block">
        {JSON.stringify(profile, null, 2)}
      </Code>
    </Box>
  );
}
