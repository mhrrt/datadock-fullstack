// import { TextField, Button } from "@mui/material"; // not req as using T
//import axios from "axios";
import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom"; // detect edit mode

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

const NewEntryPage = () => {
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<StateType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [pincodes, setPincodes] = useState<PincodeType[]>([]);

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
  });

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

    // Normal updates
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      if (isEditMode) {
        await api.put(`api/records/${id}`, payload);
      } else {
        await api.post("api/records", payload);
      }

      console.log("FormData:", formData);

      //alert("Record created successfully");
      toast.success("Record created successfully");

      if (!isEditMode) {
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
        });
      }
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
  const patternValidation = "[0-9+\-\/]*";
  const nameInputRef = useRef<HTMLInputElement>(null);
  // highlight active field
  const inputClass =
    "w-full rounded border p-3 text-medium font-semibold focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const labelClass = "mb-1 block text-xl font-bold";

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // for Edit record
  useEffect(() => {
    if (!id) return;

    const fetchRecord = async () => {
      try {
        const response = await api.get(`api/records/${id}`);

        const record = response.data;

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
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load record");
      }
    };

    fetchRecord();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-xl border-2 border-slate-500 bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-3xl font-bold">
          {isEditMode ? "Customer Edit" : "Customer Entry"}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1  gap-5 md:grid-cols-2"
        >
          {/* Entry Date */}
          <div>
            <label className={labelClass}>Entry Date</label>

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
            <label className={labelClass}>Name</label>

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
            <label className={labelClass}>Code Name</label>

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
            <label className={labelClass}>State</label>

            <select
              name="stateId"
              value={formData.stateId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select State</option>

              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className={labelClass}>City</label>

            <select
              name="cityId"
              value={formData.cityId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select City</option>

              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pincode */}
          <div>
            <label className={labelClass}>Pincode</label>

            <select
              name="pincodeId"
              value={formData.pincodeId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Pincode</option>

              {pincodes.map((pincode) => (
                <option key={pincode.id} value={pincode.id}>
                  {pincode.pinCode} - {pincode.areaName}
                </option>
              ))}
            </select>
          </div>

          {/* Phone 1 */}
          <div>
            <label className={labelClass}>Phone 1</label>

            <input
              type="text"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              pattern={patternValidation}
              className={inputClass}
            />
          </div>

          {/* Phone 2 */}
          <div>
            <label className={labelClass}>Phone 2</label>

            <input
              type="text"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              pattern={patternValidation}
              className={inputClass}
            />
          </div>

          {/* Office Phone 1 */}
          <div>
            <label className={labelClass}>Office Phone 1</label>

            <input
              type="text"
              name="officePhone1"
              value={formData.officePhone1}
              onChange={handleChange}
              pattern={patternValidation}
              className={inputClass}
            />
          </div>

          {/* Office Phone 2 */}
          <div>
            <label className={labelClass}>Office Phone 2</label>

            <input
              type="text"
              name="officePhone2"
              value={formData.officePhone2}
              onChange={handleChange}
              pattern={patternValidation}
              className={inputClass}
            />
          </div>

          {/* Bhaw MD */}
          <div>
            <label className={labelClass}>Bhaw MD</label>

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
            <label className={labelClass}>Bhaw KRM</label>

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
            <label className={labelClass}>Credit Limit</label>

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
            <label className={labelClass}>Bazar</label>

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
            <label className={labelClass}>Reference Name</label>

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
            <label className={labelClass}>Reference Number</label>

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
            <label className={labelClass}>Remark</label>

            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  // Submit the form
                  (
                    e.currentTarget.form as HTMLFormElement | null
                  )?.requestSubmit();
                }
              }}
              rows={4}
              className={inputClass}
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
