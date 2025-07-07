import React, { useState } from "react";
import { Box, Tabs, Tab, Typography, Paper, Container } from "@mui/material";

import SupplierList from "./Components/Supplier_Components/SupplierList";
import SupplierListAdvanced from "./Components/Supplier_Components/SupplierListAdvanced";
import SupplierDataDebugger from "./Components/Debug/SupplierDataDebugger";
import SupplierProductIntegrationTest from "./Components/Debug/SupplierProductIntegrationTest";
import SupplierProductsQuickTest from "./Components/Debug/SupplierProductsQuickTest";
import APIConsistencyTester from "./Components/Debug/APIConsistencyTester";
import CacheBustingTester from "./Components/Debug/CacheBustingTester_MUI";
import QuickCacheTest from "./Components/Debug/QuickCacheTest";

// Demo app để test SupplierList component và debug tools
function SupplierListDemo() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demo-tabpanel-${index}`}
      aria-labelledby={`demo-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );

  return (
    <Container maxWidth={false} sx={{ height: "100vh", p: 2 }}>
      <Paper
        elevation={3}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Supplier Management Demo & Debug Tools
          </Typography>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Supplier List" />
            <Tab label="Advanced List" />
            <Tab label="Quick Test" />
            <Tab label="Data Debugger" />
            <Tab label="Integration Test" />
            <Tab label="API Consistency" />
            <Tab label="Cache Busting" />
            <Tab label="Quick Cache" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: "100%", overflow: "hidden" }}>
              <SupplierList />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ height: "100%", overflow: "hidden" }}>
              <SupplierListAdvanced />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <SupplierProductsQuickTest />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <SupplierDataDebugger />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <SupplierProductIntegrationTest />
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <APIConsistencyTester />
          </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <CacheBustingTester />
          </TabPanel>

          <TabPanel value={tabValue} index={7}>
            <QuickCacheTest />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}

export default SupplierListDemo;
