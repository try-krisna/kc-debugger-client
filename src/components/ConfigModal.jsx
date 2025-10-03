import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Input,
  FormLabel,
  VStack,
} from "@chakra-ui/react"; 
import { DEFAULT_CONFIG } from "../utils/kc-default-config";

export default function ConfigModal({ config, setConfig, isOpen, onClose }) {
  const [localConfig, setLocalConfig] = useState(config || DEFAULT_CONFIG);

  useEffect(() => {
    if (config) setLocalConfig(config);
  }, [config]);

  const saveConfig = () => {
    setConfig(localConfig);
    localStorage.setItem("kc_config", JSON.stringify(localConfig));
    onClose();
  };

  if (!localConfig) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>⚙️ Keycloak Config</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={3} align="stretch">
            {Object.keys(localConfig).map((k) => (
              <Box key={k}>
                <FormLabel fontSize="sm">{k}</FormLabel>
                <Input
                  size="sm"
                  value={localConfig[k] || ""}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, [k]: e.target.value })
                  }
                />
              </Box>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={saveConfig}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
