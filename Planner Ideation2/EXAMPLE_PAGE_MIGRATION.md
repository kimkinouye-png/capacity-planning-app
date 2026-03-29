# Example: Scenarios.tsx Migration (Radix → Chakra)

This document shows a side-by-side comparison of migrating the **Scenarios (Plans)** page from Figma Make (Radix UI) to Cursor (Chakra UI).

---

## Before: Figma Make (Radix UI + localStorage)

```tsx
import { useState, useEffect } from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Scenario {
  id: string;
  name: string;
  status: "draft" | "committed";
  quarter: string;
  capacity: { uxDesign: number; contentDesign: number };
  demand: { uxDesign: number; contentDesign: number };
}

export function Scenarios() {
  // State from localStorage
  const [scenarios, setScenarios] = useState<Scenario[]>(() => {
    const saved = localStorage.getItem("scenarios");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuarter, setNewQuarter] = useState("Q2'26");

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("scenarios", JSON.stringify(scenarios));
  }, [scenarios]);

  const createScenario = () => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: newName,
      status: "draft",
      quarter: newQuarter,
      capacity: { uxDesign: 80, contentDesign: 40 },
      demand: { uxDesign: 0, contentDesign: 0 },
    };
    setScenarios([...scenarios, newScenario]);
    setIsCreating(false);
    setNewName("");
  };

  const deleteScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Plans</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map(scenario => (
          <Card key={scenario.id}>
            <CardHeader>
              <CardTitle>{scenario.name}</CardTitle>
              <Badge variant={scenario.status === "draft" ? "outline" : "default"}>
                {scenario.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>UX Capacity:</span>
                  <span>{scenario.capacity.uxDesign} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>UX Demand:</span>
                  <span>{scenario.demand.uxDesign} weeks</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Link to={`/scenarios/${scenario.id}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => deleteScenario(scenario.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="quarter">Quarter</Label>
              <Input
                id="quarter"
                value={newQuarter}
                onChange={e => setNewQuarter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={createScenario}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## After: Cursor (Chakra UI + API)

```tsx
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";
import {
  Box,
  Button,
  Heading,
  Badge,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Text,
  Grid,
  GridItem,
  useToast,
  Spinner,
  Center,
  IconButton,
} from "@chakra-ui/react";
import { api } from "@/services/api";
import { Scenario } from "@/types/scenario";

export function Scenarios() {
  // State with API integration
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuarter, setNewQuarter] = useState("Q2'26");
  const toast = useToast();

  // Fetch from API on mount
  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setIsLoading(true);
      const data = await api.getScenarios();
      setScenarios(data);
    } catch (error) {
      toast({
        title: "Error loading plans",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createScenario = async () => {
    try {
      const newScenario = await api.createScenario({
        name: newName,
        description: "",
        status: "draft",
        quarter: newQuarter,
        teamSize: { uxDesign: 5, contentDesign: 3 },
        capacity: { uxDesign: 80, contentDesign: 40 },
        demand: { uxDesign: 0, contentDesign: 0 },
        roadmapItemsCount: 0,
      });
      
      setScenarios([...scenarios, newScenario]);
      setIsCreating(false);
      setNewName("");
      
      toast({
        title: "Plan created",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error creating plan",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const deleteScenario = async (id: string) => {
    try {
      await api.deleteScenario(id);
      setScenarios(scenarios.filter(s => s.id !== id));
      
      toast({
        title: "Plan deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting plan",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="cyan.500" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Plans</Heading>
        <Button 
          leftIcon={<Plus size={16} />} 
          colorScheme="cyan"
          onClick={() => setIsCreating(true)}
        >
          Create Plan
        </Button>
      </HStack>

      {/* Plans Grid */}
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
        gap={4}
      >
        {scenarios.map(scenario => (
          <GridItem key={scenario.id}>
            <Box
              bg="white"
              _dark={{ bg: "gray.800" }}
              borderRadius="lg"
              shadow="sm"
              border="1px"
              borderColor="gray.200"
              _dark={{ borderColor: "gray.700" }}
              overflow="hidden"
            >
              {/* Card Header */}
              <Box 
                p={6} 
                borderBottom="1px" 
                borderColor="gray.200" 
                _dark={{ borderColor: "gray.700" }}
              >
                <HStack justify="space-between" align="start">
                  <Heading size="md">{scenario.name}</Heading>
                  <Badge 
                    colorScheme={scenario.status === "draft" ? "gray" : "blue"}
                    variant={scenario.status === "draft" ? "outline" : "solid"}
                  >
                    {scenario.status}
                  </Badge>
                </HStack>
              </Box>

              {/* Card Body */}
              <Box p={6}>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                      UX Capacity:
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {scenario.capacity.uxDesign} weeks
                    </Text>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                      UX Demand:
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {scenario.demand.uxDesign} weeks
                    </Text>
                  </HStack>
                </VStack>

                {/* Actions */}
                <HStack mt={4} spacing={2}>
                  <Link to={`/scenarios/${scenario.id}`} style={{ flex: 1 }}>
                    <Button size="sm" variant="outline" width="full">
                      View
                    </Button>
                  </Link>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Delete plan"
                    icon={<Trash2 size={16} />}
                    onClick={() => deleteScenario(scenario.id)}
                  />
                </HStack>
              </Box>
            </Box>
          </GridItem>
        ))}
      </Grid>

      {/* Create Modal */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Plan</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel htmlFor="name">Plan Name</FormLabel>
                <Input
                  id="name"
                  placeholder="e.g., Q2 2026 Planning"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel htmlFor="quarter">Quarter</FormLabel>
                <Input
                  id="quarter"
                  value={newQuarter}
                  onChange={e => setNewQuarter(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button 
              colorScheme="cyan" 
              onClick={createScenario}
              isDisabled={!newName.trim()}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
```

---

## Key Changes Summary

### 1. **Imports**
- ✅ Replaced Radix UI components with Chakra equivalents
- ✅ Added `useToast` for notifications
- ✅ Added API service import

### 2. **Data Fetching**
- ❌ Removed: `localStorage.getItem()` / `setItem()`
- ✅ Added: `api.getScenarios()`, `api.createScenario()`, `api.deleteScenario()`
- ✅ Added: Loading states (`isLoading`, `<Spinner>`)
- ✅ Added: Error handling with toast notifications

### 3. **Component Structure**
- ❌ Removed: `<Card>` → ✅ Replaced with `<Box>` with proper styling props
- ❌ Removed: `<Dialog>` → ✅ Replaced with `<Modal>`
- ❌ Removed: Tailwind classes (`className="..."`) → ✅ Replaced with Chakra props
- ✅ Added: Responsive grid with `templateColumns` breakpoints

### 4. **Styling**
- ❌ Removed: `className="flex items-center gap-4"` → ✅ `<HStack spacing={4}>`
- ❌ Removed: `className="space-y-4"` → ✅ `<VStack spacing={4}>`
- ❌ Removed: `className="grid grid-cols-3 gap-4"` → ✅ `<Grid templateColumns="repeat(3, 1fr)" gap={4}>`
- ✅ Added: Dark mode support with `_dark={{ }}` prop

### 5. **User Feedback**
- ✅ Added: `useToast()` for success/error messages
- ✅ Added: Loading spinner while fetching data
- ✅ Added: Disabled state on Create button when name is empty

### 6. **Button Variants**
- ❌ Removed: `<Button className="bg-cyan-500">` → ✅ `<Button colorScheme="cyan">`
- ✅ Added: `leftIcon` prop for icon buttons

### 7. **Type Safety**
- ✅ Kept all TypeScript interfaces
- ✅ Added proper error typing
- ✅ Imported `Scenario` type from shared types file

---

## API Service Integration Points

### Where localStorage was replaced:

```typescript
// BEFORE: Load from localStorage
const [scenarios, setScenarios] = useState(() => {
  const saved = localStorage.getItem("scenarios");
  return saved ? JSON.parse(saved) : [];
});

// AFTER: Load from API
const [scenarios, setScenarios] = useState([]);
useEffect(() => {
  api.getScenarios().then(setScenarios);
}, []);
```

```typescript
// BEFORE: Save to localStorage
useEffect(() => {
  localStorage.setItem("scenarios", JSON.stringify(scenarios));
}, [scenarios]);

// AFTER: Save via API (no side effect needed)
const createScenario = async () => {
  const newScenario = await api.createScenario(data);
  setScenarios([...scenarios, newScenario]); // Update local state only
};
```

---

## Chakra Theme Integration

Add to your `theme.ts`:

```typescript
import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    cyan: {
      50: "#e0f7fa",
      100: "#b2ebf2",
      200: "#80deea",
      300: "#4dd0e1",
      400: "#26c6da",
      500: "#00bcd4", // Primary cyan
      600: "#00acc1",
      700: "#0097a7",
      800: "#00838f",
      900: "#006064",
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "cyan",
      },
    },
  },
});
```

---

## Testing Checklist

After migration, verify:

- [ ] Plans load from database on page mount
- [ ] Loading spinner displays while fetching
- [ ] Create modal opens when clicking "Create Plan"
- [ ] New plan saves to database and appears in grid
- [ ] Delete button removes plan from database
- [ ] Success/error toasts display appropriately
- [ ] Dark mode works correctly
- [ ] Responsive grid works on mobile/tablet/desktop
- [ ] Navigation to plan detail page works

---

This example should serve as a template for migrating the other pages!
