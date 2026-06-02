// import { TextField, Button } from "@mui/material"; // not req as using T
//import axios from "axios";
import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

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
      setLoading(true);

      await api.post("api/records", {
        ...formData,

        stateId: formData.stateId ? Number(formData.stateId) : null,

        cityId: formData.cityId ? Number(formData.cityId) : null,

        pincodeId: formData.pincodeId ? Number(formData.pincodeId) : null,

        // bazarId: formData.bazarId ? Number(formData.bazarId) : null,

        bazarId: formData.bazarId || null,

        creditLimit: formData.creditLimit ? Number(formData.creditLimit) : null,
      });
      console.log("FormData:", formData);

      //alert("Record created successfully");
      toast.success("Record created successfully");

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
    } catch (error) {
      console.error(error);

      //alert("Failed to create record");
      toast.error("Failed to create record");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-3xl font-bold">New Entry</h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {/* Entry Date */}
          <div>
            <label className="mb-1 block font-medium">Entry Date</label>

            <input
              type="date"
              name="entryDate"
              value={formData.entryDate}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block font-medium">Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded border p-3"
              required
            />
          </div>

          {/* Code Name */}
          <div>
            <label className="mb-1 block font-medium">Code Name</label>

            <input
              type="text"
              name="codeName"
              value={formData.codeName}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          {/* State */}
          <div>
            <label className="mb-1 block font-medium">State</label>

            <select
              name="stateId"
              value={formData.stateId}
              onChange={handleChange}
              className="w-full rounded border p-3"
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
            <label className="mb-1 block font-medium">City</label>

            <select
              name="cityId"
              value={formData.cityId}
              onChange={handleChange}
              className="w-full rounded border p-3"
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
            <label className="mb-1 block font-medium">Pincode</label>

            <select
              name="pincodeId"
              value={formData.pincodeId}
              onChange={handleChange}
              className="w-full rounded border p-3"
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
            <label className="mb-1 block font-medium">Phone 1</label>

            <input
              type="text"
              name="phone1"
              value={formData.phone1}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          {/* Phone 2 */}
          <div>
            <label className="mb-1 block font-medium">Phone 2</label>

            <input
              type="text"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          {/* Office Phone 1 */}
          <div>
            <label className="mb-1 block font-medium">Office Phone 1</label>

            <input
              type="text"
              name="officePhone1"
              value={formData.officePhone1}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          {/* Office Phone 2 */}
          <div>
            <label className="mb-1 block font-medium">Office Phone 2</label>

            <input
              type="text"
              name="officePhone2"
              value={formData.officePhone2}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          {/* Bhaw MD */}
          <div>
            <label className="mb-1 block font-medium">Bhaw MD</label>

            <input
              type="text"
              name="bhawMD"
              value={formData.bhawMD}
              onChange={handleChange}
              placeholder="1-0-1.2-4.5-3.2-0-0"
              className="w-full rounded border p-3"
            />
          </div>

          {/* Bhaw KRM */}
          <div>
            <label className="mb-1 block font-medium">Bhaw KRM</label>

            <input
              type="text"
              name="bhawKRM"
              value={formData.bhawKRM}
              onChange={handleChange}
              placeholder="1-0-1.2-4.5-3.2-0-0"
              className="w-full rounded border p-3"
            />
          </div>

          {/* Credit Limit */}
          <div>
            <label className="mb-1 block font-medium">Credit Limit</label>

            <input
              type="number"
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          {/* Bazar dropdown*/}
          {/* <div>
            <label className="mb-1 block font-medium">Bazar</label>

            <select
              name="bazarId"
              value={formData.bazarId}
              onChange={handleChange}
              className="w-full rounded border p-3"
            >
              <option value="">Select Bazar</option>
            </select>
          </div> */}
          {/* Bazar */}
          <div>
            <label className="mb-1 block font-medium">Bazar</label>

            <input
              type="text"
              name="bazarId"
              value={formData.bazarId}
              onChange={handleChange}
              placeholder="Enter Bazar"
              className="w-full rounded border p-3"
            />
          </div>

          {/* Reference Number */}
          <div>
            <label className="mb-1 block font-medium">Reference Number</label>

            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          {/* Reference Name */}
          <div>
            <label className="mb-1 block font-medium">Reference Name</label>

            <input
              type="text"
              name="referenceName"
              value={formData.referenceName}
              onChange={handleChange}
              className="w-full rounded border p-3"
            />
          </div>

          {/* Remark */}
          <div className="md:col-span-2">
            <label className="mb-1 block font-medium">Remark</label>

            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows={4}
              className="w-full rounded border p-3"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEntryPage;
