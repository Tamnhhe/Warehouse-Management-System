import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Alert,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import supplierAPI from "../../API/supplierAPI";
import supplierProductAPI from "../../API/supplierProductAPI";

const CacheBustingTester = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const testCacheBusting = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog("🚀 Starting cache-busting test...");

    try {
      // Test 1: Supplier API với multiple calls
      addLog("📊 Testing Supplier API cache-busting...");
      const start1 = Date.now();
      const response1 = await supplierAPI.getAll();
      const time1 = Date.now() - start1;
      addLog(`✅ First supplier call: ${response1.status} in ${time1}ms`);

      // Đợi 1 giây rồi gọi lại
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const start2 = Date.now();
      const response2 = await supplierAPI.getAll();
      const time2 = Date.now() - start2;
      addLog(`✅ Second supplier call: ${response2.status} in ${time2}ms`);

      // Test 2: SupplierProduct API
      if (response1.data?.data?.length > 0) {
        const supplierId =
          response1.data.data[0]._id || response1.data.data[0].id;
        addLog(`🔍 Testing SupplierProduct API for supplier ${supplierId}...`);

        const start3 = Date.now();
        const response3 = await supplierProductAPI.getProductsBySupplier(
          supplierId
        );
        const time3 = Date.now() - start3;
        addLog(`✅ First product call: ${response3.status} in ${time3}ms`);

        // Đợi 1 giây rồi gọi lại
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const start4 = Date.now();
        const response4 = await supplierProductAPI.getProductsBySupplier(
          supplierId
        );
        const time4 = Date.now() - start4;
        addLog(`✅ Second product call: ${response4.status} in ${time4}ms`);

        setTestResults({
          supplier1: {
            status: response1.status,
            time: time1,
            data: response1.data,
          },
          supplier2: {
            status: response2.status,
            time: time2,
            data: response2.data,
          },
          product1: {
            status: response3.status,
            time: time3,
            data: response3.data,
          },
          product2: {
            status: response4.status,
            time: time4,
            data: response4.data,
          },
        });
      } else {
        setTestResults({
          supplier1: {
            status: response1.status,
            time: time1,
            data: response1.data,
          },
          supplier2: {
            status: response2.status,
            time: time2,
            data: response2.data,
          },
        });
      }

      addLog("🎉 Cache-busting test completed!");
    } catch (error) {
      addLog(`❌ Error during test: ${error.message}`);
      console.error("Cache-busting test error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults({});
    setLogs([]);
  };

  const getStatusColor = (status) => {
    if (status === 200) return "success";
    if (status === 304) return "warning";
    return "error";
  };

  return (
    <Box sx={{ maxWidth: "xl", mx: "auto", p: 2 }}>
      <Card>
        <CardHeader
          title={
            <Typography variant="h5" component="h3">
              🚫 Cache-Busting Tester
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="textSecondary">
              Test if cache-busting headers prevent 304 Not Modified responses
            </Typography>
          }
        />
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
            <Button
              onClick={testCacheBusting}
              disabled={isLoading}
              variant="contained"
              color="primary"
            >
              {isLoading ? "Testing..." : "🧪 Run Cache-Busting Test"}
            </Button>
            <Button
              onClick={clearResults}
              variant="outlined"
              disabled={isLoading}
            >
              🗑️ Clear Results
            </Button>
          </Box>

          {/* Live Logs */}
          {logs.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📝 Test Logs:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "grey.100",
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {logs.map((log, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    component="div"
                    sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                  >
                    {log}
                  </Typography>
                ))}
              </Paper>
            </Box>
          )}

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📊 Test Results:
              </Typography>

              {/* Supplier API Results */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        📞 Supplier Call #1
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body2">Status:</Typography>
                          <Chip
                            label={testResults.supplier1?.status}
                            color={getStatusColor(
                              testResults.supplier1?.status
                            )}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2">
                          Time: {testResults.supplier1?.time}ms
                        </Typography>
                        <Typography variant="body2">
                          Data count:{" "}
                          {testResults.supplier1?.data?.data?.length ||
                            testResults.supplier1?.data?.length ||
                            0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        📞 Supplier Call #2
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body2">Status:</Typography>
                          <Chip
                            label={testResults.supplier2?.status}
                            color={getStatusColor(
                              testResults.supplier2?.status
                            )}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2">
                          Time: {testResults.supplier2?.time}ms
                        </Typography>
                        <Typography variant="body2">
                          Data count:{" "}
                          {testResults.supplier2?.data?.data?.length ||
                            testResults.supplier2?.data?.length ||
                            0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Product API Results */}
              {testResults.product1 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          🛍️ Product Call #1
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2">Status:</Typography>
                            <Chip
                              label={testResults.product1?.status}
                              color={getStatusColor(
                                testResults.product1?.status
                              )}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2">
                            Time: {testResults.product1?.time}ms
                          </Typography>
                          <Typography variant="body2">
                            Data count:{" "}
                            {testResults.product1?.data?.data?.length ||
                              testResults.product1?.data?.length ||
                              0}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          🛍️ Product Call #2
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2">Status:</Typography>
                            <Chip
                              label={testResults.product2?.status}
                              color={getStatusColor(
                                testResults.product2?.status
                              )}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2">
                            Time: {testResults.product2?.time}ms
                          </Typography>
                          <Typography variant="body2">
                            Data count:{" "}
                            {testResults.product2?.data?.data?.length ||
                              testResults.product2?.data?.length ||
                              0}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Analysis */}
              <Alert
                severity={
                  testResults.supplier1?.status === 304 ||
                  testResults.supplier2?.status === 304 ||
                  testResults.product1?.status === 304 ||
                  testResults.product2?.status === 304
                    ? "warning"
                    : "success"
                }
              >
                <Typography variant="body2">
                  <strong>Analysis:</strong>{" "}
                  {testResults.supplier1?.status === 304 ||
                  testResults.supplier2?.status === 304 ||
                  testResults.product1?.status === 304 ||
                  testResults.product2?.status === 304 ? (
                    <span>
                      ⚠️ Still receiving 304 responses. Cache-busting may need
                      backend support.
                    </span>
                  ) : (
                    <span>
                      ✅ All calls returned 200. Cache-busting is working!
                    </span>
                  )}
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CacheBustingTester;
