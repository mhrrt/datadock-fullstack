// import { TextField, Button } from "@mui/material"; // not req as using T
//import axios from "axios";
import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom"; // detect edit mode
import { useNavigate } from "react-router-dom";
import "../status.css";

type FormData = {
  entryDate: string;

  name: string;
  codeName: string;

  stateId: string;
  cityId: string;

  pincodeId: string;

  phone1: string;
  phone2: string;

  officePhone1: string;
  officePhone2: string;

  bhawMD: string;
  bhawKRM: string;

  creditLimit: string;

  bazarId: string;

  referenceNumber: string;
  referenceName: string;

  remark: string;

  //adding option for pending, recoved and status for customer
  pendingAmount: number;
  receivedAmount: number;
  outstandingAmount: number;
  recoveryRemark: string;
  status: "ACTIVE" | "INACTIVE" | "RESTRICTED";
  isActive: boolean;
};

type StateType = {
  id: number;
  name: string;
  code: string;
};

type CityType = {
  id: number;
  name: string;
  stateId: number;
};

type PincodeType = {
  id: number;
  cityId: number;
  areaName: string;
  pinCode: number;
};

//empty form data tobe loaded when "new" is clicked
// const emptyFormData: FormData = {
//   entryDate: new Date().toISOString().split("T")[0],

//   name: "",
//   codeName: "",

//   stateId: "",
//   cityId: "",
//   pincodeId: "",

//   phone1: "",
//   phone2: "",

//   officePhone1: "",
//   officePhone2: "",

//   bhawMD: "",
//   bhawKRM: "",

//   creditLimit: "",

//   bazarId: "",

//   referenceNumber: "",
//   referenceName: "",

//   remark: "",
// };

const NewEntryPage = () => {
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<StateType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [pincodes, setPincodes] = useState<PincodeType[]>([]);
  //for Working vs suspended
  const [originalIsActive, setOriginalIsActive] = useState<boolean>(true);

  // commented as created emptyfordata object
  const [formData, setFormData] = useState<FormData>({
    entryDate: new Date().toISOString().split("T")[0],

    name: "",
    codeName: "",

    stateId: "",
    cityId: "",
    pincodeId: "",

    phone1: "",
    phone2: "",

    officePhone1: "",
    officePhone2: "",

    bhawMD: "",
    bhawKRM: "",

    creditLimit: "",

    bazarId: "",

    referenceNumber: "",
    referenceName: "",

    remark: "",

    // adding option for pending amount, recoved amount, status
    pendingAmount: 0,
    receivedAmount: 0,
    outstandingAmount: 0,
    recoveryRemark: "",
    status: "ACTIVE",

    //for working vs suspended customer
    isActive: true,
  });

  // const [formData, setFormData] = useState<FormData>(emptyFormData);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    const phoneFields = ["phone1", "phone2", "officePhone1", "officePhone2"];
    if (phoneFields.includes(name)) {
      const regex = /^[0-9+\-\/ ]*$/;

      if (!regex.test(value)) {
        return;
      }
    }

    // Reset city + pincode when state changes
    if (name === "stateId") {
      setFormData((prev) => ({
        ...prev,
        stateId: value,
        cityId: "",
        pincodeId: "",
      }));

      return;
    }

    // Reset pincode when city changes
    if (name === "cityId") {
      setFormData((prev) => ({
        ...prev,
        cityId: value,
        pincodeId: "",
      }));

      return;
    }

    if (["pendingAmount", "receivedAmount"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    }

    if (name === "isActive") {
      setFormData((prev) => ({
        ...prev,
        isActive: value === "true",
      }));
      return;
    }

    // Normal updates
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      // will be for edit mode only
      return;
    }
    try {
      const payload = {
        ...formData,

        stateId: formData.stateId ? Number(formData.stateId) : null,

        cityId: formData.cityId ? Number(formData.cityId) : null,

        pincodeId: formData.pincodeId ? Number(formData.pincodeId) : null,

        // bazarId: formData.bazarId ? Number(formData.bazarId) : null,

        bazarId: formData.bazarId || null,

        creditLimit: formData.creditLimit ? Number(formData.creditLimit) : null,
      };

      setLoading(true);

      console.log("UPDATE DATA:", {
        ...payload,
        pincodeId: formData.pincodeId ? Number(formData.pincodeId) : null,
      });

      if (isEditMode) {
        console.log(`record updateding for: ${payload}`);
        await api.put(`api/records/${id}`, payload);
        //alert("Record created successfully");
        toast.success("Record updated successfully");
        navigate("/search");
      } else {
        await api.post("api/records", payload);
        //alert("Record created successfully");
        toast.success("Record created successfully");
      }

      console.log("FormData:", formData);
      // clear field for edit as well
      // if (!isEditMode) {
      setFormData({
        entryDate: new Date().toISOString().split("T")[0],

        name: "",
        codeName: "",

        stateId: "",
        cityId: "",
        pincodeId: "",

        phone1: "",
        phone2: "",

        officePhone1: "",
        officePhone2: "",

        bhawMD: "",
        bhawKRM: "",

        creditLimit: "",

        bazarId: "",

        referenceNumber: "",
        referenceName: "",

        remark: "",

        //update pending, recoved and status
        // adding option for pending amount, recoved amount, status
        pendingAmount: 0,
        receivedAmount: 0,
        outstandingAmount: 0,
        recoveryRemark: "",
        status: "ACTIVE",
        isActive: true,
      });
      // set focus on name
      nameInputRef.current?.focus();
      // }
    } catch (error) {
      console.error(error);

      //alert("Failed to create record");
      toast.error("Failed to create record");
    } finally {
      setLoading(false);
    }
  };

  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStates = async () => {
      try {
        // const response = await axios.get("http://localhost:5000/states");
        console.log(`API url is:`, api.defaults.baseURL);
        const response = await api.get("/states");
        console.log(`Fetching state from ${response.data}`);
        //alert(`Fetching state from db: ${response}`);
        setStates(response.data);
      } catch (error) {
        console.error("Failed to fetch states", error);
      }
    };

    fetchStates();
  }, []);

  useEffect(() => {
    if (!formData.stateId) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      try {
        // const response = await axios.get(
        //   `http://localhost:5000/cities/${formData.stateId}`,
        // );
        const response = api.get(`/cities/${formData.stateId}`);
        setCities((await response).data);
        // alert(`Fetching cities from db: ${response}`);
      } catch (error) {
        console.error("Failed to fetch cities", error);
      }
    };

    fetchCities();
  }, [formData.stateId]);

  useEffect(() => {
    if (!formData.cityId) {
      setPincodes([]);
      return;
    }

    const fetchPincodes = async () => {
      try {
        // const response = await axios.get(
        //   `http://localhost:5000/pincodes/${formData.cityId}`,
        // );
        const response = api.get(`/pincodes/${formData.cityId}`);
        //alert(`Fetching pincodes from db: ${response}`);
        setPincodes((await response).data);
      } catch (error) {
        console.error("Failed to fetch pincodes", error);
      }
    };

    fetchPincodes();
  }, [formData.cityId]);

  // pattern validation
  // const patternValidation = "[0-9+\\-/ ]*";
  const nameInputRef = useRef<HTMLInputElement>(null);
  // highlight active field
  // const inputClass =
  //   "w-full rounded border p-3 text-medium font-semibold focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const inputClass =
    "w-full rounded border p-3 text-medium font-semibold text-#1e3a8a-700 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "mb-1 block text-xl text-#4f3dd9-800 font-bold";

  useEffect(() => {
    nameInputRef.current?.focus();
    console.log("isActive:", formData.isActive);
    console.log("isActive type:", typeof formData.isActive);
    console.log("isActive value:", JSON.stringify(formData.isActive));
  }, []);

  // for Edit record
  useEffect(() => {
    if (!id) return;

    const fetchRecord = async () => {
      try {
        const response = await api.get(`api/records/${id}`);

        const record = response.data;
        //on loading set userstate
        setOriginalIsActive(Boolean(record.isActive));

        setFormData({
          entryDate: record.entryDate?.split("T")[0] ?? "",

          name: record.name ?? "",
          codeName: record.codeName ?? "",

          stateId: String(record.stateId ?? ""),
          cityId: String(record.cityId ?? ""),
          pincodeId: String(record.pincodeId ?? ""),

          phone1: record.phone1 ?? "",
          phone2: record.phone2 ?? "",

          officePhone1: record.officePhone1 ?? "",
          officePhone2: record.officePhone2 ?? "",

          bhawMD: record.bhawMD ?? "",
          bhawKRM: record.bhawKRM ?? "",

          creditLimit: String(record.creditLimit ?? ""),

          bazarId: record.bazarId ?? "",

          referenceNumber: record.referenceNumber ?? "",
          referenceName: record.referenceName ?? "",

          remark: record.remark ?? "",

          // adding option for pending amount, recoved amount, status
          pendingAmount: record.pendingAmount ?? 0,
          receivedAmount: record.receivedAmount ?? 0,
          outstandingAmount:
            Number(record.pendingAmount || 0) -
            Number(record.receivedAmount || 0),
          recoveryRemark: record.recoveryRemark || "",
          status: record.status || "ACTIVE",
          isActive: Boolean(record.isActive),
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load record");
      }
    };

    fetchRecord();
  }, [id]);

  // // reset screen when id is cleared
  // useEffect(() => {
  //   if (!id) {
  //     setFormData(emptyFormData);

  //     setCities([]);
  //     setPincodes([]);
  //   }
  // }, [id]);

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;

    // // Allow multiline remarks
    // if (e.target instanceof HTMLTextAreaElement) {
    //   return;
    // }

    e.preventDefault();

    (e.currentTarget as HTMLFormElement).requestSubmit();
  };

  useEffect(() => {
    const pending = Number(formData.pendingAmount || 0);

    const received = Number(formData.receivedAmount || 0);

    const outstanding = pending - received;

    let status: FormData["status"] = "ACTIVE";

    if (pending > 0) {
      if (received === 0) {
        status = "INACTIVE";
      } else if (outstanding > 0) {
        status = "RESTRICTED";
      }
    }

    setFormData((prev) => ({
      ...prev,
      outstandingAmount: outstanding,
      status,
    }));
  }, [formData.pendingAmount, formData.receivedAmount]);

  const validateForm = () => {
    if (
      isEditMode &&
      formData.isActive !== originalIsActive &&
      !formData.recoveryRemark?.trim()
    ) {
      alert("Recovery Remark is mandatory when Customer Status is changed.");
      return false;
    }

    return true;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-xl border-2 border-slate-500 bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-3xl font-bold text-[#1E40AF]">
          {isEditMode ? "Customer Edit" : "Customer Entry"}
        </h1>

        <form
          onSubmit={handleSubmit}
          onKeyDown={handleFormKeyDown}
          className="grid grid-cols-1  gap-5 md:grid-cols-2"
        >
          {/* {For Customer Status as WORKING SUSPENDED} */}
          {isEditMode && (
            <div>
              <label className={labelClass}>CUSTOMER STATUS</label>

              {/* <select
                name="isActive"
                value={String(formData.isActive)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === "true",
                  }))
                }
                className={`w-full rounded border p-3 font-semibold ${
                  formData.isActive
                    ? "bg-green-400 text-black"
                    : "bg-red-400 text-white"
                }`}
              >
                <option value="WORKING">WORKING</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select> */}
              <select
                name="isActive"
                value={String(formData.isActive)}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === "true",
                  }))
                }
                className={`w-full rounded border p-3 font-semibold ${
                  formData.isActive
                    ? "bg-green-400 text-black"
                    : "bg-red-400 text-white"
                }`}
              >
                <option value="true">WORKING</option>
                <option value="false">SUSPENDED</option>
              </select>
            </div>
          )}
          {/* Entry Date */}
          <div>
            <label className={labelClass}>ENTRY DATE</label>

            <input
              type="date"
              name="entryDate"
              value={formData.entryDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Name */}
          <div>
            <label className={labelClass}>NAME</label>

            <input
              ref={nameInputRef}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Code Name */}
          <div>
            <label className={labelClass}>CODE NAME</label>

            <input
              type="text"
              name="codeName"
              value={formData.codeName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* State */}
          <div>
            <label className={labelClass}>STATE</label>

            <select
              name="stateId"
              value={formData.stateId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select State</option>

              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className={labelClass}>CITY</label>

            <select
              name="cityId"
              value={formData.cityId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select City</option>

              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Pincode */}
          <div>
            <label className={labelClass}>PINCODE</label>

            <select
              name="pincodeId"
              value={formData.pincodeId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Pincode</option>

              {pincodes.map((pincode) => (
                <option key={pincode.id} value={pincode.id}>
                  {pincode.pinCode} - {pincode.areaName.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Phone 1 */}
          <div>
            <label className={labelClass}>PHONE 1</label>

            <input
              type="text"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              //pattern={patternValidation}
              className={inputClass}
            />
          </div>

          {/* Phone 2 */}
          <div>
            <label className={labelClass}>PHONE 2</label>

            <input
              type="text"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              //pattern={patternValidation}
              className={inputClass}
            />
          </div>

          {/* Office Phone 1 */}
          <div>
            <label className={labelClass}>OFFICE PHONE 1</label>

            <input
              type="text"
              name="officePhone1"
              value={formData.officePhone1}
              onChange={handleChange}
              //pattern={patternValidation}
              className={inputClass}
            />
          </div>

          {/* Office Phone 2 */}
          <div>
            <label className={labelClass}>OFFICE PHONE 2</label>

            <input
              type="text"
              name="officePhone2"
              value={formData.officePhone2}
              onChange={handleChange}
              //pattern={patternValidation}
              className={inputClass}
            />
          </div>

          {/* Bhaw MD */}
          <div>
            <label className={labelClass}>BHAV MD</label>

            <input
              type="text"
              name="bhawMD"
              value={formData.bhawMD}
              onChange={handleChange}
              placeholder="1-0-1.2-4.5-3.2-0-0"
              className={inputClass}
            />
          </div>

          {/* Bhaw KRM */}
          <div>
            <label className={labelClass}>BHAV KRM</label>

            <input
              type="text"
              name="bhawKRM"
              value={formData.bhawKRM}
              onChange={handleChange}
              placeholder="1-0-1.2-4.5-3.2-0-0"
              className={inputClass}
            />
          </div>

          {/* Credit Limit */}
          <div>
            <label className={labelClass}>CREDIT LIMIT</label>

            <input
              type="number"
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Bazar dropdown*/}
          {/* <div>
            <label className={labelClass}>Bazar</label>

            <select
              name="bazarId"
              value={formData.bazarId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Bazar</option>
            </select>
          </div> */}
          {/* Bazar */}
          <div>
            <label className={labelClass}>BAZAR</label>

            <input
              type="text"
              name="bazarId"
              value={formData.bazarId}
              onChange={handleChange}
              placeholder="Enter Bazar"
              className={inputClass}
            />
          </div>

          {/* Reference Name */}
          <div>
            <label className={labelClass}>REFERENCE NAME</label>

            <input
              type="text"
              name="referenceName"
              value={formData.referenceName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Reference Number */}
          <div>
            <label className={labelClass}>REFERENCE NUMBER</label>

            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Remark */}
          <div className="md:col-span-2">
            <label className={labelClass}>REMARK</label>

            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows={4}
              className={inputClass}
            />
          </div>

          {/* <div className="form-row"> */}
          <div>
            {/* <label htmlFor="pendingAmount">Pending Amount</label> */}
            <label className={labelClass}>PENDING AMOUNT</label>
            <input
              id="pendingAmount"
              name="pendingAmount"
              type="number"
              min="0"
              step="1000"
              value={formData.pendingAmount}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>RECEIVED AMOUNT</label>
            <input
              id="receivedAmount"
              name="receivedAmount"
              type="number"
              min="0"
              step="1000"
              value={formData.receivedAmount}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          {/* </div> */}

          {/* <div className="form-row"> */}
          <div>
            <label className={labelClass}>OUTSTANDING AMOUNT</label>
            <input
              id="outstandingAmount"
              name="outstandingAmount"
              type="number"
              value={formData.outstandingAmount}
              readOnly
              disabled
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>STATUS</label>
            <input
              id="status"
              name="status"
              type="text"
              value={formData.status}
              readOnly
              disabled
              // className={`status-${formData.status.toLowerCase()}`}
              className={`w-full rounded border p-3 text-medium font-semibold text-blue-700 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.status?.toLowerCase() === "active"
                  ? "bg-green-400"
                  : formData.status?.toLowerCase() === "restricted"
                    ? "bg-orange-300"
                    : "bg-red-400"
              }`}
            />
          </div>
          {/* </div> */}

          <div className="md:col-span-2">
            <label className={labelClass}>
              RECOVERY REMARK
              {isEditMode && formData.isActive !== originalIsActive && (
                <span className="text-red-500"> *</span>
              )}
            </label>

            <textarea
              id="recoveryRemark"
              name="recoveryRemark"
              rows={4}
              value={formData.recoveryRemark}
              onChange={handleChange}
              placeholder="Enter recovery details, payment commitments, follow-up notes, etc."
              className={`w-full rounded border p-3 text-medium font-semibold text-#1e3a8a-700 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isEditMode &&
                formData.isActive !== originalIsActive &&
                !formData.recoveryRemark?.trim()
                  ? "border-red-500"
                  : ""
              }`}
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Record"
                  : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntryPage;
