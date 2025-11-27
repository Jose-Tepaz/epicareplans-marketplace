"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { NewsletterSection } from "@/components/newsletter-section";
import { InsuranceCard } from "@/components/insurance-card";
import { InsuranceFiltersSidebar } from "@/components/insurance-filters-sidebar";
import { UserInfoSummary } from "@/components/user-info-summary";
import { ApiWarningNotification } from "@/components/api-warning-notification";
import { InsuranceEmptyState } from "@/components/insurance-empty-state";
import { EditInformationModal } from "@/components/edit-information-modal";
import { FloatingCartButton } from "@/components/floating-cart-button";
import { FloatingCompareButton } from "@/components/floating-compare-button";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InsurancePlan } from "@/lib/types/insurance";
import { useClientOnly } from "@/hooks/use-client-only";
import { Edit3, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getUserProfile } from "@/lib/api/enrollment-db";
import { useRouter } from "next/navigation";
import { FamilyMembersManager } from "@/components/family-members-manager";
import { useFamilyMembers } from "@/hooks/use-family-members";

import type { FamilyMember } from "@/lib/types/enrollment";

export default function InsuranceOptionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isClient = useClientOnly();
  const { familyMembers, isInitialized: isFamilyInitialized } = useFamilyMembers();

  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [hasStoredFormData, setHasStoredFormData] = useState(false);
  const lastAutoFetchPayloadRef = useRef<string | null>(null);

  // Filter states
  const [selectedPlanType, setSelectedPlanType] = useState<string>("all");
  const [selectedProductType, setSelectedProductType] = useState<string>("all");
  const [selectedCarrier, setSelectedCarrier] = useState<string>("all");
  const [manhattanLifeAgentProducts, setManhattanLifeAgentProducts] = useState<
    string[]
  >([]);
  const [sortBy, setSortBy] = useState<string>("default");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 6;

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showApiWarning, setShowApiWarning] = useState(false);

  // Profile validation states
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  // Form data states
  const [formData, setFormData] = useState({
    zipCode: "",
    dateOfBirth: "",
    gender: "",
    smokes: false,
    lastTobaccoUse: "",
    coverageStartDate: "",
    paymentFrequency: "",
  });

  const normalizeAgentProducts = (products: any[]): string[] => {
    return Array.from(
      new Set(
        products
          .filter((name): name is string => typeof name === "string")
          .map((name) => name.trim())
          .filter((name) => name.length > 0)
      )
    );
  };

  const normalizeInsurancePlan = (plan: any): InsurancePlan => {
    return {
      id: String(plan?.id ?? ""),
      name: plan?.name ?? "Unknown Plan",
      price:
        typeof plan?.price === "number" ? plan.price : Number(plan?.price ?? 0),
      coverage: plan?.coverage ?? "",
      productType: plan?.productType ?? "",
      benefits: Array.isArray(plan?.benefits) ? plan.benefits : [],
      allState: Boolean(plan?.allState),
      manhattanLife: Boolean(plan?.manhattanLife),
      planType: plan?.planType ?? "",
      benefitDescription: plan?.benefitDescription ?? "",
      brochureUrl: plan?.brochureUrl ?? plan?.pathToBrochure ?? undefined,
      carrierName: plan?.carrierName ?? undefined,
      carrierSlug:
        plan?.carrierSlug ?? (plan?.allState ? "allstate" : undefined),
      productCode: plan?.productCode ?? undefined,
      planKey: plan?.planKey ?? undefined,
      metadata: plan?.metadata ?? undefined,
    };
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPlanType, selectedProductType, selectedCarrier, sortBy]);

  // Verificar si el usuario autenticado tiene campos faltantes en su perfil
  useEffect(() => {
    if (user && isClient) {
      checkRequiredFields();
    }
  }, [user, isClient]);

  const checkRequiredFields = async () => {
    setIsCheckingProfile(true);
    try {
      const profile = await getUserProfile();
      const missing = [];

      // Verificar campos requeridos de explore
      if (!profile?.zip_code) missing.push("ZIP Code");
      if (!profile?.date_of_birth) missing.push("Date of Birth");
      if (!profile?.gender) missing.push("Gender");
      if (profile?.is_smoker === null || profile?.is_smoker === undefined) {
        missing.push("Smoking Status");
      }

      if (missing.length > 0) {
        console.log("❌ Missing required fields:", missing);
        setMissingFields(missing);
      } else {
        console.log("✅ All required profile fields are present");
        setMissingFields([]);
      }
    } catch (error) {
      console.error("❌ Error checking profile fields:", error);
    } finally {
      setIsCheckingProfile(false);
    }
  };

  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (!isClient) return;
    
    // Cargar planes y configuración desde sessionStorage al inicio
    console.log("🔄 [INIT] Loading stored plans from sessionStorage");

    const storedPlans = sessionStorage.getItem("insurancePlans");
    const storedAgentProducts = sessionStorage.getItem("manhattanLifeAgentProducts");

    if (storedPlans) {
      try {
        const plans = JSON.parse(storedPlans);
        console.log("💾 [INIT] Found stored plans:", plans.length, "plans");

        if (Array.isArray(plans) && plans.length > 0) {
          const normalized = plans.map(normalizeInsurancePlan);
          setInsurancePlans(normalized);
          setCurrentPage(1);
          console.log("✅ [INIT] Loaded", normalized.length, "plans from storage");
        } else {
          console.log("⚠️  [INIT] Stored plans array is empty");
        }

        if (storedAgentProducts) {
          try {
            const parsedProducts = JSON.parse(storedAgentProducts);
            if (Array.isArray(parsedProducts)) {
              setManhattanLifeAgentProducts(normalizeAgentProducts(parsedProducts));
            } else {
              setManhattanLifeAgentProducts([]);
            }
          } catch {
            setManhattanLifeAgentProducts([]);
          }
        } else {
          setManhattanLifeAgentProducts([]);
        }
        setLoading(false);
        return;
      } catch (error) {
        console.error("❌ [INIT] Error parsing stored plans:", error);
      }
    }

    // Si no hay planes almacenados, inicializamos vacío y loading false (el useEffect de auto-fetch se encargará si hay datos)
    console.log("⚠️  [INIT] No stored plans found in sessionStorage");
    setInsurancePlans([]);
    setLoading(false);
  }, [isClient]);

  // Load form data from sessionStorage
  useEffect(() => {
    if (!isClient) return;

    const storedFormData = sessionStorage.getItem("insuranceFormData");
    if (storedFormData) {
      try {
        const data = JSON.parse(storedFormData);
        console.log("Loaded form data from sessionStorage:", data);
        setFormData(data);
        setHasStoredFormData(true);
      } catch (error) {
        console.error("Error parsing stored form data:", error);
      }
    } else {
      // Fallback: intentar con explore_data
      const exploreData =
        sessionStorage.getItem("explore_data") ||
        localStorage.getItem("explore_data");
      if (exploreData) {
        try {
          const e = JSON.parse(exploreData);
          const mapped = {
            zipCode: e.zip_code || "",
            dateOfBirth: e.date_of_birth || "",
            gender: e.gender || "",
            smokes: !!e.is_smoker,
            lastTobaccoUse: e.last_tobacco_use || "",
            coverageStartDate: "",
            paymentFrequency: "",
          };
          console.log("Mapped form data from explore_data:", mapped);
          setFormData(mapped);
          setHasStoredFormData(true);
        } catch (err) {
          console.error("Error parsing explore_data:", err);
        }
      } else {
        console.log("No stored form data found");
      }
    }
  }, [isClient]);

  // When authenticated, prefer Supabase profile over any local/session values for core fields
  useEffect(() => {
    const syncFromProfile = async () => {
      if (!user) return;
      try {
        const profile = await getUserProfile();
        if (!profile) return;
        const merged = {
          ...formData,
          zipCode: profile.zip_code || formData.zipCode || "",
          dateOfBirth: profile.date_of_birth || formData.dateOfBirth || "",
          gender: profile.gender || formData.gender || "",
          smokes:
            typeof formData.smokes === "boolean"
              ? formData.smokes
              : !!profile.is_smoker,
          lastTobaccoUse:
            formData.lastTobaccoUse || profile.last_tobacco_use || "",
        };
        setFormData(merged);
        try {
          sessionStorage.setItem("insuranceFormData", JSON.stringify(merged));
        } catch {}
      } catch (e) {
        console.error("Failed to sync form data from profile:", e);
      }
    };
    if (user && isClient) {
      syncFromProfile();
    }
  }, [user, isClient]);

    // Try to auto-fetch plans using stored/profile data when the list is empty
  useEffect(() => {
    // Early exit if not on client
    if (!isClient) return;

    // Wait for family members to initialize if user is logged in
    if (user && !isFamilyInitialized) return;

    const shouldAttemptAutoFetch = () => {
      // Avoid parallel fetches
      if (isFetchingPlans) return false;
      // Require either: user with no missing fields, or stored form data for guests
      if (user && missingFields.length === 0) return true;
      if (!user && hasStoredFormData) return true;
      return false;
    };

    const buildPayload = async () => {
      // ... (keep existing implementation)
      // Prefer session formData; merge with profile for missing pieces
      let payload: any = { ...formData };
      try {
        if (user) {
          const profile = await getUserProfile();
          payload = {
            zipCode: payload.zipCode || profile?.zip_code || "",
            dateOfBirth: payload.dateOfBirth || profile?.date_of_birth || "",
            gender: payload.gender || profile?.gender || "",
            smokes:
              typeof payload.smokes === "boolean"
                ? payload.smokes
                : !!profile?.is_smoker,
            lastTobaccoUse:
              payload.lastTobaccoUse || profile?.last_tobacco_use || "",
            // Defaults if absent
            coverageStartDate:
              payload.coverageStartDate ||
              new Date(Date.now() + 86400000).toISOString().split("T")[0],
            paymentFrequency: payload.paymentFrequency || "monthly",
          };

          // Include dependents from hook
          if (familyMembers.length > 0) {
            const activeMembers = familyMembers.filter(m => m.included_in_quote !== false);
            if (activeMembers.length > 0) {
              payload.dependents = activeMembers;
            }
          }
        } else {
          // Guest: ensure defaults
          payload.coverageStartDate =
            payload.coverageStartDate ||
            new Date(Date.now() + 86400000).toISOString().split("T")[0];
          payload.paymentFrequency = payload.paymentFrequency || "monthly";
        }
      } catch (e) {
        console.error("Error building payload from profile:", e);
      }
      return payload;
    };

    const attemptFetch = async () => {
      if (!shouldAttemptAutoFetch()) return;

      const payload = await buildPayload();
      
      // Check essential fields
      if (!payload.zipCode || !payload.dateOfBirth || !payload.gender) {
        return;
      }

      const payloadKey = JSON.stringify({
        zipCode: payload.zipCode,
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
        smokes: payload.smokes,
        coverageStartDate: payload.coverageStartDate,
        paymentFrequency: payload.paymentFrequency,
        dependents: payload.dependents?.map((d: any) => d.id).sort()
      });

      // 1. Check in-memory ref (avoid loop in same session)
      if (lastAutoFetchPayloadRef.current === payloadKey) {
        return;
      }

      // 2. Check session storage cache (avoid re-fetch on navigation back)
      if (insurancePlans.length > 0) {
         const storedPayloadKey = sessionStorage.getItem("lastFetchPayloadKey");
         if (storedPayloadKey === payloadKey) {
           // Update ref to prevent future loops
           lastAutoFetchPayloadRef.current = payloadKey;
           return;
         }
      }

      // Only set loading state if we are ACTUALLY going to fetch
      setIsFetchingPlans(true);
      lastAutoFetchPayloadRef.current = payloadKey;

      try {
        console.log("🔍 [AUTO-FETCH] Starting with payload:", payload);
        
        // ... fetch logic ...
        console.log("📤 [AUTO-FETCH] Sending request to /api/insurance/quote", payload);
        const resp = await fetch("/api/insurance/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          throw new Error(`Failed to fetch plans (${resp.status})`);
        }

        const result = await resp.json();
        const plans = Array.isArray(result?.plans) ? result.plans : [];
        
        if (plans.length > 0) {
          const normalizedPlans = plans.map(normalizeInsurancePlan);
          setInsurancePlans(normalizedPlans);
          setCurrentPage(1);

          const rawProducts = result?.carriers?.manhattanLife?.products || [];
          const mlProducts = normalizeAgentProducts(rawProducts);
          setManhattanLifeAgentProducts(mlProducts);

          setError(null);
          
          try {
            sessionStorage.setItem("insurancePlans", JSON.stringify(normalizedPlans));
            sessionStorage.setItem("insuranceFormData", JSON.stringify(payload));
            sessionStorage.setItem("manhattanLifeAgentProducts", JSON.stringify(mlProducts));
            sessionStorage.setItem("lastFetchPayloadKey", payloadKey);
          } catch (e) {
            console.warn("Failed to save to sessionStorage", e);
          }
        } else {
          setInsurancePlans([]);
          setError("No plans were returned for the provided information.");
        }
      } catch (err) {
        console.error("❌ [AUTO-FETCH] Exception:", err);
        setError(err instanceof Error ? err.message : "Problem fetching plans");
      } finally {
        setIsFetchingPlans(false);
      }
    };

    attemptFetch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    missingFields.length,
    isFetchingPlans,
    hasStoredFormData,
    isClient,
    insurancePlans.length,
    isFamilyInitialized,
    familyMembers
  ]);

  // Function to update plans with new form data
  const handleUpdateInformation = async (activeMembers?: FamilyMember[]) => {
    const currentPayload = {
      ...formData,
      coverageStartDate: formData.coverageStartDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      paymentFrequency: formData.paymentFrequency || "monthly",
    };

    const payloadKey = JSON.stringify({
      zipCode: currentPayload.zipCode,
      dateOfBirth: currentPayload.dateOfBirth,
      gender: currentPayload.gender,
      smokes: currentPayload.smokes,
      coverageStartDate: currentPayload.coverageStartDate,
      paymentFrequency: currentPayload.paymentFrequency,
      dependents: activeMembers?.map(d => d.id).sort()
    });

    if (lastAutoFetchPayloadRef.current === payloadKey) {
        console.log("⏭️  [UPDATE] Skipping - same payload already fetched");
        return;
    }

    setIsUpdating(true);
    setError(null); // Clear previous errors

    // Log the data being sent for debugging
    console.log("=== SENDING DATA TO API ===");
    console.log("Form Data:", JSON.stringify(formData, null, 2));
    if (activeMembers) {
      console.log("Active Family Members:", activeMembers.length);
    }
    
    // ... existing logs ...
    console.log("Required fields check:");
    console.log("  - zipCode:", formData.zipCode || "MISSING");
    console.log("  - dateOfBirth:", formData.dateOfBirth || "MISSING");
    console.log("  - gender:", formData.gender || "MISSING");
    console.log("  - smokes:", formData.smokes);
    console.log(
      "  - coverageStartDate:",
      formData.coverageStartDate || "MISSING"
    );
    console.log(
      "  - paymentFrequency:",
      formData.paymentFrequency || "MISSING"
    );

    const payloadForRequest: any = {
      ...formData,
      coverageStartDate:
        formData.coverageStartDate ||
        new Date(Date.now() + 86400000).toISOString().split("T")[0],
      paymentFrequency: formData.paymentFrequency || "monthly",
    };
    
    // Include dependents if provided (even if empty, to clear them)
    if (activeMembers) {
      payloadForRequest.dependents = activeMembers;
    }

    try {
      lastAutoFetchPayloadRef.current = null;

      const response = await fetch("/api/insurance/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadForRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response Error:", response.status, errorText);
        let message = `Insurance API failed: ${response.status}`;
        try {
          const parsed = JSON.parse(errorText);
          message = parsed?.error || parsed?.message || message;
        } catch {
          if (errorText) {
            message = `${message} - ${errorText}`;
          }
        }
        throw new Error(message);
      }

      const result = await response.json();
      console.log("API Response:", result);

      const plans = Array.isArray(result?.plans) ? result.plans : [];
      const normalizedPlans = plans.map(normalizeInsurancePlan);
      const rawProducts = Array.isArray(
        result?.carriers?.manhattanLife?.products
      )
        ? result.carriers.manhattanLife.products
        : [];
      const mlProducts = normalizeAgentProducts(rawProducts);

      // Update sessionStorage
      sessionStorage.setItem(
        "insuranceFormData",
        JSON.stringify(payloadForRequest)
      );

      if (normalizedPlans.length > 0) {
        sessionStorage.setItem(
          "insurancePlans",
          JSON.stringify(normalizedPlans)
        );
        sessionStorage.setItem(
          "manhattanLifeAgentProducts",
          JSON.stringify(mlProducts)
        );

        // Update state
        setFormData(payloadForRequest);
        setInsurancePlans(normalizedPlans);
        setManhattanLifeAgentProducts(mlProducts);
        setCurrentPage(1);
        setError(null);
      } else {
        console.warn("No plans returned from API");
        sessionStorage.removeItem("insurancePlans");
        sessionStorage.removeItem("manhattanLifeAgentProducts");
        setInsurancePlans([]);
        setManhattanLifeAgentProducts([]);
        setCurrentPage(1);
        setError(
          "No plans were returned for the provided information. Please review your details and try again."
        );
      }

      setIsEditModalOpen(false);

      // Reset filters
      setSelectedPlanType("all");
      setSelectedProductType("all");
      setSelectedCarrier("all");
      setSortBy("default");
    } catch (error) {
      console.error("Error updating insurance quotes:", error);

      sessionStorage.setItem(
        "insuranceFormData",
        JSON.stringify(payloadForRequest)
      );
      if (insurancePlans.length === 0) {
        setInsurancePlans([]);
        setManhattanLifeAgentProducts([]);
        setCurrentPage(1);
      }
      setError(
        error instanceof Error
          ? error.message
          : "There was a problem fetching plans. Please try again later."
      );
      setIsEditModalOpen(false);

      // Show warning notification
      setShowApiWarning(true);

      // Auto-hide warning after 8 seconds
      setTimeout(() => {
        setShowApiWarning(false);
      }, 8000);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter and sort plans
  const getFilteredAndSortedPlans = () => {
    let filtered = [...insurancePlans];

    // Filter by carrier
    if (selectedCarrier !== "all") {
      filtered = filtered.filter((plan) => {
        const carrierSlug =
          plan.carrierSlug || (plan.allState ? "allstate" : "other");
        return carrierSlug === selectedCarrier;
      });
    }

    // Filter by plan type
    if (selectedPlanType !== "all") {
      const selectedLower = selectedPlanType.toLowerCase();
      const dynamicPlanNamesLower = manhattanLifeAgentProducts.map((name) =>
        name.toLowerCase()
      );

      filtered = filtered.filter((plan) => {
        const planTypeLower = plan.planType?.toLowerCase() || "";
        const productNameLower = (
          plan.metadata?.productName ||
          plan.productType ||
          ""
        )
          .toString()
          .toLowerCase();

        if (selectedLower === "accident") {
          return (
            planTypeLower.includes("nic") ||
            planTypeLower.includes("afb") ||
            planTypeLower.includes("accident")
          );
        } else if (selectedLower === "life") {
          return planTypeLower.includes("life");
        } else if (selectedLower === "dental") {
          return planTypeLower.includes("dental");
        } else if (selectedLower === "vision") {
          return planTypeLower.includes("vision");
        }

        if (dynamicPlanNamesLower.includes(selectedLower)) {
          return productNameLower === selectedLower;
        }

        return (
          planTypeLower === selectedLower || productNameLower === selectedLower
        );
      });
    }

    // Filter by product type
    if (selectedProductType !== "all") {
      filtered = filtered.filter((plan) => {
        if (selectedProductType === "supplemental") {
          return plan.productType?.toLowerCase().includes("supplemental");
        } else if (selectedProductType === "primary") {
          return plan.productType?.toLowerCase().includes("primary");
        } else if (selectedProductType === "secondary") {
          return plan.productType?.toLowerCase().includes("secondary");
        }
        return true;
      });
    }

    // Sort plans
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "coverage") {
      // Sort by coverage amount (extract numbers from coverage string)
      filtered.sort((a, b) => {
        const aAmount = parseInt(a.coverage.replace(/[^0-9]/g, "")) || 0;
        const bAmount = parseInt(b.coverage.replace(/[^0-9]/g, "")) || 0;
        return bAmount - aAmount;
      });
    } else if (sortBy === "popular") {
      // Sort by allState status (allState plans first)
      filtered.sort((a, b) => {
        if (a.allState && !b.allState) return -1;
        if (!a.allState && b.allState) return 1;
        return 0;
      });
    }

    return filtered;
  };

  const filteredPlans = getFilteredAndSortedPlans();
  const totalPages =
    filteredPlans.length > 0 ? Math.ceil(filteredPlans.length / PAGE_SIZE) : 1;
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedPlans = filteredPlans.slice(
    (currentPageSafe - 1) * PAGE_SIZE,
    currentPageSafe * PAGE_SIZE
  );

  useEffect(() => {
    const newTotalPages =
      filteredPlans.length > 0
        ? Math.ceil(filteredPlans.length / PAGE_SIZE)
        : 1;
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [filteredPlans.length, currentPage]);

  // Debug log for rendering
  console.log("🎨 [RENDER] State:", {
    insurancePlans: insurancePlans.length,
    filteredPlans: filteredPlans.length,
    loading,
    error,
    isFetchingPlans,
    hasStoredFormData,
    user: user ? "authenticated" : "guest",
    missingFields: missingFields.length,
  });

  // Mostrar loading mientras verifica autenticación
  if (authLoading || isCheckingProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-gray-600">
              {isCheckingProfile ? "Checking your profile..." : "Loading..."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Si el usuario está autenticado y faltan campos, mostrar alerta
  if (user && missingFields.length > 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <Alert className="border-yellow-400 bg-yellow-50">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-yellow-900 text-lg mb-2">
                      Complete Your Profile
                    </h3>
                    <p className="text-yellow-800 mb-3">
                      We need some additional information to show you the best
                      insurance plans tailored to your needs:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-yellow-800 mb-4">
                      {missingFields.map((field) => (
                        <li key={field}>{field}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    onClick={() =>
                      router.push("/explore?skip-account-question=true")
                    }
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Complete My Profile
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Si es invitado y no tenemos datos almacenados para cotizar, pedir completar
  if (!user && !hasStoredFormData && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <Alert className="border-yellow-400 bg-yellow-50">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-yellow-900 text-lg mb-2">
                      Complete Your Information
                    </h3>
                    <p className="text-yellow-800 mb-3">
                      We need some information to show you accurate plans (ZIP,
                      Date of Birth, Gender).
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      router.push("/explore?skip-account-question=true")
                    }
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Complete My Profile
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            Loading your insurance options...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12">
          {/* Page header */}
          <div className="mb-12">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Your Insurance Options
              </h1>

              <div className="flex items-center gap-4">
                {/* Family Members Manager - only show if plans are loaded */}
                {insurancePlans.length > 0 && (
                  <div>
                    <FamilyMembersManager 
                      showTitle={true} 
                      compact={false} 
                      onMemberChange={handleUpdateInformation}
                    />
                  </div>
                )}

                {/* Edit Information Button */}
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Information
                </Button>
              </div>
            </div>
            <p className="text-gray-600 text-lg">
              Based on your information, here are the best insurance plans
              available in your area.
            </p>
            {/* User Information Summary */}
            <UserInfoSummary formData={formData} />

            {/* API Warning Notification */}
            <ApiWarningNotification
              show={showApiWarning}
              onClose={() => setShowApiWarning(false)}
            />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-red-700 text-sm mb-2">
                      <strong>Error:</strong> {error}
                    </p>
                    <p className="text-red-600 text-xs">
                      Intenta con datos diferentes o limpia el caché y recarga
                      la página.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      sessionStorage.clear();
                      localStorage.clear();
                      window.location.reload();
                    }}
                    variant="outline"
                    size="sm"
                    className="ml-4 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Limpiar y Recargar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Main content with sidebar */}
          <div className="flex flex-col lg:flex-row gap-8 relative">
            
            {/* Loading Overlay */}
            {isUpdating && (
              <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center backdrop-blur-sm rounded-lg">
                <div className="text-center bg-white p-6 rounded-xl shadow-lg border">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                  <p className="font-medium text-gray-900">Updating plans...</p>
                  <p className="text-sm text-gray-500">Calculating new prices based on your selection</p>
                </div>
              </div>
            )}

            {/* Filters Sidebar Component */}
            <InsuranceFiltersSidebar
              selectedPlanType={selectedPlanType}
              selectedProductType={selectedProductType}
              sortBy={sortBy}
              selectedCarrier={selectedCarrier}
              onPlanTypeChange={setSelectedPlanType}
              onProductTypeChange={setSelectedProductType}
              onSortChange={setSortBy}
              onCarrierChange={setSelectedCarrier}
              plans={insurancePlans}
              dynamicPlanTypes={manhattanLifeAgentProducts}
            />

            {/* Main content - Insurance cards grid */}
            <div className="flex-1">
              {filteredPlans.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-gray-600">
                      Showing{" "}
                      <span className="font-semibold text-gray-900">
                        {filteredPlans.length}
                      </span>{" "}
                      {filteredPlans.length === 1 ? "plan" : "plans"}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {paginatedPlans.map((plan) => (
                      <InsuranceCard key={plan.id} plan={plan} />
                    ))}
                  </div>
                  {filteredPlans.length > PAGE_SIZE && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                      <Button
                        variant="outline"
                        disabled={currentPageSafe === 1}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-gray-600">
                        Página{" "}
                        <span className="font-semibold text-gray-900">
                          {currentPageSafe}
                        </span>{" "}
                        de{" "}
                        <span className="font-semibold text-gray-900">
                          {totalPages}
                        </span>
                      </span>
                      <Button
                        variant="outline"
                        disabled={currentPageSafe === totalPages}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <InsuranceEmptyState
                  onClearFilters={() => {
                    setSelectedPlanType("all");
                    setSelectedProductType("all");
                    setSelectedCarrier("all");
                    setSortBy("default");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <NewsletterSection />
      <Footer />

      {/* Floating Buttons */}
      <FloatingCompareButton />
      <FloatingCartButton />

      {/* Edit Information Modal Component */}
      <EditInformationModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        formData={formData}
        onFormDataChange={setFormData}
        isUpdating={isUpdating}
        error={error}
        onUpdate={handleUpdateInformation}
        onQuickSave={() => {
          sessionStorage.setItem("insuranceFormData", JSON.stringify(formData));
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
}
