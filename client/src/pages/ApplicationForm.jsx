import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Trash2 } from "lucide-react";

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [collateral, setCollateral] = useState([
    { schemeName: "", isin: "", category: "EQUITY", units: "", currentNav: "" },
  ]);
  const [requestedAmount, setRequestedAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  const addCollateralRow = () => {
    setCollateral([
      ...collateral,
      {
        schemeName: "",
        isin: "",
        category: "EQUITY",
        units: "",
        currentNav: "",
      },
    ]);
  };

  const removeCollateralRow = (index) => {
    if (collateral.length > 1) {
      const newCollateral = collateral.filter((_, i) => i !== index);
      setCollateral(newCollateral);
    }
  };

  const updateCollateral = (index, field, value) => {
    const newCollateral = [...collateral];
    newCollateral[index][field] = value;
    setCollateral(newCollateral);
  };

  const calculateTotalValue = () => {
    return collateral.reduce(
      (acc, item) => acc + Number(item.units) * Number(item.currentNav),
      0,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!selectedProduct) throw new Error("Please select a loan product");

      const payload = {
        productId: selectedProduct,
        requestedLoanAmount: Number(requestedAmount),
        collateral: collateral.map((c) => ({
          ...c,
          units: Number(c.units),
          currentNav: Number(c.currentNav),
        })),
      };

      await api.post("/applications", payload);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit application",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          New Loan Application
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle>1. Select Loan Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => setSelectedProduct(product._id)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      selectedProduct === product._id
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                        : "hover:border-gray-400"
                    }`}
                  >
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {product.type} Fund Loan
                    </p>
                    <div className="mt-2 text-sm">
                      <span className="block">
                        Interest: {product.interestRate}%
                      </span>
                      <span className="block">Max LTV: {product.maxLTV}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Collateral Input */}
          <Card>
            <CardHeader>
              <CardTitle>2. Add Collateral Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {collateral.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-4 rounded-md border p-4 md:grid-cols-12 bg-gray-50/50 items-end"
                >
                  <div className="md:col-span-4">
                    <Label>Scheme Name</Label>
                    <Input
                      placeholder="e.g. HDFC Top 100"
                      value={item.schemeName}
                      onChange={(e) =>
                        updateCollateral(index, "schemeName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label>ISIN</Label>
                    <Input
                      placeholder="INF..."
                      value={item.isin}
                      onChange={(e) =>
                        updateCollateral(index, "isin", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Units</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={item.units}
                      onChange={(e) =>
                        updateCollateral(index, "units", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>NAV (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={item.currentNav}
                      onChange={(e) =>
                        updateCollateral(index, "currentNav", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeCollateralRow(index)}
                      disabled={collateral.length === 1}
                      title="Remove Scheme"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addCollateralRow}
                className="w-full"
              >
                + Add Another Scheme
              </Button>

              <div className="mt-4 text-right">
                <p className="text-lg font-medium">
                  Total Collateral Value: ₹
                  {calculateTotalValue().toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card>
            <CardHeader>
              <CardTitle>3. Loan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Label htmlFor="amount">Requested Loan Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Processing..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
