# Radix UI → Chakra UI Component Translation Guide

Quick reference for translating Figma Make components (Radix UI) to Cursor (Chakra UI).

---

## Import Statements

### Radix (Figma Make)
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
```

### Chakra (Cursor)
```typescript
import { 
  Button, 
  Box, 
  Heading, 
  Modal, 
  ModalOverlay, 
  ModalContent,
  Input, 
  FormLabel,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel 
} from "@chakra-ui/react";
```

---

## 1. Dialog/Modal

### ❌ Radix (Remove)
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Create New Plan</DialogTitle>
      <DialogDescription>
        Set up a new capacity planning scenario
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      {/* form content */}
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleCreate}>Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### ✅ Chakra (Replace with)
```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>
      Create New Plan
      <Text fontSize="sm" fontWeight="normal" color="gray.600" mt={1}>
        Set up a new capacity planning scenario
      </Text>
    </ModalHeader>
    <ModalCloseButton />
    
    <ModalBody>
      <VStack spacing={4}>
        {/* form content */}
      </VStack>
    </ModalBody>
    
    <ModalFooter>
      <Button variant="ghost" mr={3} onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button colorScheme="cyan" onClick={handleCreate}>
        Create
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

---

## 2. Card

### ❌ Radix (Remove)
```tsx
<Card>
  <CardHeader>
    <CardTitle>Q2 2026 Planning</CardTitle>
    <CardDescription>Initial planning scenario</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* content */}
    </div>
  </CardContent>
</Card>
```

### ✅ Chakra (Replace with)
```tsx
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
  <Box p={6} borderBottom="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
    <Heading size="md">Q2 2026 Planning</Heading>
    <Text color="gray.600" _dark={{ color: "gray.400" }} mt={1} fontSize="sm">
      Initial planning scenario
    </Text>
  </Box>
  <Box p={6}>
    <VStack spacing={4} align="stretch">
      {/* content */}
    </VStack>
  </Box>
</Box>
```

**Reusable Card Component (Recommended):**
```tsx
// components/Card.tsx
export const Card = ({ children, ...props }) => (
  <Box
    bg="white"
    _dark={{ bg: "gray.800" }}
    borderRadius="lg"
    shadow="sm"
    border="1px"
    borderColor="gray.200"
    _dark={{ borderColor: "gray.700" }}
    {...props}
  >
    {children}
  </Box>
);

export const CardHeader = ({ children }) => (
  <Box p={6} borderBottom="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
    {children}
  </Box>
);

export const CardBody = ({ children }) => (
  <Box p={6}>{children}</Box>
);
```

---

## 3. Tabs

### ❌ Radix (Remove)
```tsx
<Tabs defaultValue="manual">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="manual">Manual Setup</TabsTrigger>
    <TabsTrigger value="paste">Paste Data</TabsTrigger>
    <TabsTrigger value="upload">Upload File</TabsTrigger>
  </TabsList>
  
  <TabsContent value="manual">
    <div>Manual setup form</div>
  </TabsContent>
  
  <TabsContent value="paste">
    <div>Paste form</div>
  </TabsContent>
  
  <TabsContent value="upload">
    <div>Upload form</div>
  </TabsContent>
</Tabs>
```

### ✅ Chakra (Replace with)
```tsx
<Tabs colorScheme="cyan">
  <TabList>
    <Tab>Manual Setup</Tab>
    <Tab>Paste Data</Tab>
    <Tab>Upload File</Tab>
  </TabList>
  
  <TabPanels>
    <TabPanel>
      <VStack spacing={4}>Manual setup form</VStack>
    </TabPanel>
    
    <TabPanel>
      <VStack spacing={4}>Paste form</VStack>
    </TabPanel>
    
    <TabPanel>
      <VStack spacing={4}>Upload form</VStack>
    </TabPanel>
  </TabPanels>
</Tabs>
```

---

## 4. Form Fields

### ❌ Radix (Remove)
```tsx
<div className="space-y-2">
  <Label htmlFor="name">Plan Name</Label>
  <Input
    id="name"
    placeholder="e.g., Q2 2026 Planning"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
</div>

<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea
    id="description"
    placeholder="Optional description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />
</div>
```

### ✅ Chakra (Replace with)
```tsx
<FormControl>
  <FormLabel htmlFor="name">Plan Name</FormLabel>
  <Input
    id="name"
    placeholder="e.g., Q2 2026 Planning"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
</FormControl>

<FormControl>
  <FormLabel htmlFor="description">Description</FormLabel>
  <Textarea
    id="description"
    placeholder="Optional description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />
</FormControl>
```

---

## 5. Select

### ❌ Radix (Remove)
```tsx
<Select value={quarter} onValueChange={setQuarter}>
  <SelectTrigger>
    <SelectValue placeholder="Choose quarter" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Q2'26">Q2'26</SelectItem>
    <SelectItem value="Q3'26">Q3'26</SelectItem>
    <SelectItem value="Q4'26">Q4'26</SelectItem>
  </SelectContent>
</Select>
```

### ✅ Chakra (Replace with)
```tsx
<Select 
  value={quarter} 
  onChange={(e) => setQuarter(e.target.value)}
  placeholder="Choose quarter"
>
  <option value="Q2'26">Q2'26</option>
  <option value="Q3'26">Q3'26</option>
  <option value="Q4'26">Q4'26</option>
</Select>
```

---

## 6. Button

### ❌ Radix (Remove)
```tsx
<Button variant="outline" size="sm" onClick={handleClick}>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>

<Button variant="ghost" onClick={handleDelete}>
  <Trash2 className="h-4 w-4" />
</Button>
```

### ✅ Chakra (Replace with)
```tsx
<Button 
  variant="outline" 
  size="sm" 
  leftIcon={<Plus size={16} />} 
  onClick={handleClick}
>
  Add Item
</Button>

<Button 
  variant="ghost" 
  size="sm"
  onClick={handleDelete}
>
  <Trash2 size={16} />
</Button>
```

**Primary CTA (cyan accent):**
```tsx
// Radix
<Button className="bg-cyan-500 hover:bg-cyan-600">Create</Button>

// Chakra
<Button colorScheme="cyan">Create</Button>
```

---

## 7. Badge

### ❌ Radix (Remove)
```tsx
<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
  Draft
</Badge>

<Badge variant="default" className="bg-blue-500 text-white">
  Committed
</Badge>
```

### ✅ Chakra (Replace with)
```tsx
<Badge colorScheme="green" variant="subtle">
  Draft
</Badge>

<Badge colorScheme="blue">
  Committed
</Badge>
```

---

## 8. Alert

### ❌ Radix (Remove)
```tsx
<Alert variant="default">
  <Info className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    This action cannot be undone.
  </AlertDescription>
</Alert>
```

### ✅ Chakra (Replace with)
```tsx
<Alert status="info">
  <AlertIcon />
  <Box>
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>
      This action cannot be undone.
    </AlertDescription>
  </Box>
</Alert>
```

---

## 9. Slider

### ❌ Radix (Remove)
```tsx
<Slider
  value={[value]}
  onValueChange={(vals) => setValue(vals[0])}
  min={1}
  max={10}
  step={1}
/>
<span>{value}</span>
```

### ✅ Chakra (Replace with)
```tsx
<Slider
  value={value}
  onChange={(val) => setValue(val)}
  min={1}
  max={10}
  step={1}
  colorScheme="cyan"
>
  <SliderTrack>
    <SliderFilledTrack />
  </SliderTrack>
  <SliderThumb />
</Slider>
<Text>{value}</Text>
```

---

## 10. Switch (Toggle)

### ❌ Radix (Remove)
```tsx
<div className="flex items-center space-x-2">
  <Switch
    checked={enabled}
    onCheckedChange={setEnabled}
    id="effort-model"
  />
  <Label htmlFor="effort-model">Enable Effort Model</Label>
</div>
```

### ✅ Chakra (Replace with)
```tsx
<FormControl display="flex" alignItems="center">
  <FormLabel htmlFor="effort-model" mb={0}>
    Enable Effort Model
  </FormLabel>
  <Switch
    id="effort-model"
    isChecked={enabled}
    onChange={(e) => setEnabled(e.target.checked)}
    colorScheme="cyan"
  />
</FormControl>
```

---

## 11. Accordion

### ❌ Radix (Remove)
```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>What is capacity planning?</AccordionTrigger>
    <AccordionContent>
      Capacity planning helps you balance team resources...
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### ✅ Chakra (Replace with)
```tsx
<Accordion allowToggle>
  <AccordionItem>
    <AccordionButton>
      <Box flex="1" textAlign="left">
        What is capacity planning?
      </Box>
      <AccordionIcon />
    </AccordionButton>
    <AccordionPanel>
      Capacity planning helps you balance team resources...
    </AccordionPanel>
  </AccordionItem>
</Accordion>
```

---

## 12. Breadcrumb

### ❌ Radix (Remove)
```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/scenarios">Plans</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Q2 2026 Planning</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### ✅ Chakra (Replace with)
```tsx
<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/scenarios">Plans</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem isCurrentPage>
    <BreadcrumbLink>Q2 2026 Planning</BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>
```

---

## 13. Tooltip

### ❌ Radix (Remove)
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="sm">
        <Info className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Additional information</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### ✅ Chakra (Replace with)
```tsx
<Tooltip label="Additional information" hasArrow>
  <IconButton
    variant="ghost"
    size="sm"
    icon={<Info size={16} />}
    aria-label="Info"
  />
</Tooltip>
```

---

## 14. Table

### ❌ Radix (Remove)
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### ✅ Chakra (Replace with)
```tsx
<Table variant="simple">
  <Thead>
    <Tr>
      <Th>Name</Th>
      <Th>Status</Th>
    </Tr>
  </Thead>
  <Tbody>
    <Tr>
      <Td>Item 1</Td>
      <Td>Active</Td>
    </Tr>
  </Tbody>
</Table>
```

---

## 15. Separator/Divider

### ❌ Radix (Remove)
```tsx
<Separator className="my-4" />
```

### ✅ Chakra (Replace with)
```tsx
<Divider my={4} />
```

---

## Layout Utilities

### Spacing & Flex

#### ❌ Radix (Tailwind)
```tsx
<div className="flex items-center gap-4">
  <div className="flex-1">Content</div>
  <div className="space-y-4">Items</div>
</div>
```

#### ✅ Chakra
```tsx
<HStack spacing={4}>
  <Box flex={1}>Content</Box>
  <VStack spacing={4}>Items</VStack>
</HStack>
```

### Grid Layout

#### ❌ Radix (Tailwind)
```tsx
<div className="grid grid-cols-2 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

#### ✅ Chakra
```tsx
<Grid templateColumns="repeat(2, 1fr)" gap={4}>
  <GridItem>Column 1</GridItem>
  <GridItem>Column 2</GridItem>
</Grid>
```

---

## Dark Mode

### ❌ Radix (Manual class toggling)
```tsx
const [isDark, setIsDark] = useState(false);

useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDark]);

// Usage in components
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

### ✅ Chakra (Built-in ColorMode)
```tsx
import { useColorMode, useColorModeValue } from "@chakra-ui/react";

const { colorMode, toggleColorMode } = useColorMode();

// Usage in components
<Box 
  bg={useColorModeValue("white", "gray.800")} 
  color={useColorModeValue("gray.900", "white")}
>
  Content
</Box>

// Or shorthand
<Box bg="white" _dark={{ bg: "gray.800" }}>
  Content
</Box>
```

---

## Common Patterns

### Loading State

```tsx
// Chakra
<Button isLoading loadingText="Saving..." colorScheme="cyan">
  Save Changes
</Button>

<Spinner size="lg" color="cyan.500" />
```

### Empty State

```tsx
<Center py={12}>
  <VStack spacing={4}>
    <Icon as={Inbox} boxSize={12} color="gray.400" />
    <Heading size="md" color="gray.600">No plans yet</Heading>
    <Text color="gray.500">Create your first plan to get started</Text>
    <Button colorScheme="cyan" leftIcon={<Plus size={16} />}>
      Create Plan
    </Button>
  </VStack>
</Center>
```

### Error State

```tsx
<Alert status="error">
  <AlertIcon />
  <AlertTitle>Error!</AlertTitle>
  <AlertDescription>Failed to load data.</AlertDescription>
</Alert>
```

---

## Icons (No Change Needed!)

Both Radix and Chakra work great with `lucide-react`:

```tsx
import { Plus, Trash2, Edit2, Info, CheckCircle } from "lucide-react";

// Use directly in Chakra
<Button leftIcon={<Plus size={16} />}>Add</Button>
<Icon as={CheckCircle} color="green.500" />
```

---

## Quick Migration Checklist

- [ ] Replace all `Dialog` with `Modal`
- [ ] Replace all `Card` with custom Card component or Box
- [ ] Update `Tabs` component structure
- [ ] Change `Label` to `FormLabel`
- [ ] Simplify `Select` components
- [ ] Update `Button` with `colorScheme` and `leftIcon`/`rightIcon`
- [ ] Replace Tailwind classes with Chakra props
- [ ] Convert dark mode from manual classes to Chakra's ColorMode
- [ ] Wrap app in `ChakraProvider`
- [ ] Update theme with cyan accent colors

---

This guide should make the component translation straightforward!
