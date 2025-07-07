import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Alert,
  AlertTitle,
  Typography,
  Box,
  Grid,
  Skeleton,
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
        const supplierId = response1.data.data[0].id;
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">🚫 Cache-Busting Tester</h3>
          <p className="text-sm text-gray-600">
            Test if cache-busting headers prevent 304 Not Modified responses
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={testCacheBusting}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? "Testing..." : "🧪 Run Cache-Busting Test"}
            </Button>
            <Button
              onClick={clearResults}
              variant="outline"
              disabled={isLoading}
            >
              🗑️ Clear Results
            </Button>
          </div>

          {/* Live Logs */}
          {logs.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">📝 Test Logs:</h4>
              <div className="bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">📊 Test Results:</h4>

              {/* Supplier API Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-3">
                  <h5 className="font-medium text-sm mb-2">
                    📞 Supplier Call #1
                  </h5>
                  <div className="text-xs space-y-1">
                    <div>
                      Status:{" "}
                      <span
                        className={`font-bold ${
                          testResults.supplier1?.status === 200
                            ? "text-green-600"
                            : testResults.supplier1?.status === 304
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {testResults.supplier1?.status}
                      </span>
                    </div>
                    <div>Time: {testResults.supplier1?.time}ms</div>
                    <div>
                      Data count:{" "}
                      {testResults.supplier1?.data?.data?.length || 0}
                    </div>
                  </div>
                </Card>

                <Card className="p-3">
                  <h5 className="font-medium text-sm mb-2">
                    📞 Supplier Call #2
                  </h5>
                  <div className="text-xs space-y-1">
                    <div>
                      Status:{" "}
                      <span
                        className={`font-bold ${
                          testResults.supplier2?.status === 200
                            ? "text-green-600"
                            : testResults.supplier2?.status === 304
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {testResults.supplier2?.status}
                      </span>
                    </div>
                    <div>Time: {testResults.supplier2?.time}ms</div>
                    <div>
                      Data count:{" "}
                      {testResults.supplier2?.data?.data?.length || 0}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Product API Results */}
              {testResults.product1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-3">
                    <h5 className="font-medium text-sm mb-2">
                      🛍️ Product Call #1
                    </h5>
                    <div className="text-xs space-y-1">
                      <div>
                        Status:{" "}
                        <span
                          className={`font-bold ${
                            testResults.product1?.status === 200
                              ? "text-green-600"
                              : testResults.product1?.status === 304
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          {testResults.product1?.status}
                        </span>
                      </div>
                      <div>Time: {testResults.product1?.time}ms</div>
                      <div>
                        Data count:{" "}
                        {testResults.product1?.data?.data?.length || 0}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-3">
                    <h5 className="font-medium text-sm mb-2">
                      🛍️ Product Call #2
                    </h5>
                    <div className="text-xs space-y-1">
                      <div>
                        Status:{" "}
                        <span
                          className={`font-bold ${
                            testResults.product2?.status === 200
                              ? "text-green-600"
                              : testResults.product2?.status === 304
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          {testResults.product2?.status}
                        </span>
                      </div>
                      <div>Time: {testResults.product2?.time}ms</div>
                      <div>
                        Data count:{" "}
                        {testResults.product2?.data?.data?.length || 0}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Analysis */}
              <Alert>
                <AlertDescription>
                  <strong>Analysis:</strong>
                  {testResults.supplier1?.status === 304 ||
                  testResults.supplier2?.status === 304 ||
                  testResults.product1?.status === 304 ||
                  testResults.product2?.status === 304 ? (
                    <span className="text-orange-600">
                      {" "}
                      ⚠️ Still receiving 304 responses. Cache-busting may need
                      backend support.
                    </span>
                  ) : (
                    <span className="text-green-600">
                      {" "}
                      ✅ All calls returned 200. Cache-busting is working!
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheBustingTester;
