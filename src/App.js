import "./App.css";
import React, { useState, useEffect } from "react";
import { urqlClient, fetchProfiles } from "./api";
import ABI from "./abi.json";
import { ethers } from "ethers";

const address = "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";

function App() {
  // states
  const [values, setValues] = useState({
    username: "",
    handle: "",
    bio: "",
    profilePic: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profiles, setProfiles] = useState([]);

  // data destructuring
  const { username, handle, profilePic, bio } = values;

  // call preload
  useEffect(() => {
    getProfile();
  }, [profiles, values]);

  // fetching profiles
  const getProfile = async () => {
    try {
      const response = await urqlClient.query(fetchProfiles).toPromise();
      // console.log(response.data.recommendedProfiles);
      setProfiles(response.data.recommendedProfiles);
    } catch (err) {
      console.log(err);
    }
  };

  // wallet connect
  const connect = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log("accounts", accounts);
  };

  // creating profile
  const makeProfile = async () => {
    try {
      const accounts = await window.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      console.log("provider: ", provider);

      const signer = provider.getSigner();

      console.log("signer", signer);

      const contract = new ethers.Contract(address, ABI, signer);
      const zero_address = ethers.constants.AddressZero;

      // create profile object
      const profileRequest = {
        to: signer,
        handle: handle,
        imageURI: "",
        followModule: zero_address,
        followModuleData: "",
        followNFTURI: "",
      };

      console.log("create data:", profileRequest);

      const tx = await contract.createProfile(profileRequest);
      await tx.wait();
      console.log("tx", tx);
      console.log("created profile successfully");
    } catch (err) {
      console.log(err);
    }
  };

  // error message
  const errorMessage = () => {
    return (
      <div
        style={{ display: error ? "block" : "none" }}
        className="alert alert-danger"
      >
        {error}
      </div>
    );
  };

  // success message
  const successMessage = () => {
    return (
      <div
        className="alert alert-success"
        style={{ display: success ? "" : "none" }}
      >
        Profile has been created successfully!
      </div>
    );
  };

  // handle change
  const handleChange = (name) => (event) => {
    setError(false);
    const value =
      name === "profilePic" ? event.target.files[0] : event.target.value;
    setValues({ ...values, [name]: value });
  };

  // on submit
  // const onSubmit = async (event) => {
  //   event.preventDefault();
  //   setSuccess(false);
  //   setError(false);
  //   console.log("create data:", profileRequest);
  //   await makeProfile()
  //     .then((data) => {
  //       console.log("data", data);
  //       if (data.error) {
  //         setError(data.error);
  //         setSuccess(false);
  //       } else {
  //         setSuccess(true);
  //         setValues({
  //           ...values,
  //           formData: "",
  //           username: "",
  //           bio: "",
  //         });
  //         setProfileRequest({
  //           to: "",
  //           handle: "",
  //           imageURI: "",
  //           followModule: "0x00",
  //           followModuleData: "",
  //           followNFTURI: "",
  //         });
  //       }
  //     })
  //     .catch(setError("profile creation failed"));
  // };

  return (
    <div className="App">
      <p className="App-title">Lets Connect</p>
      <button className="thm-btn" onClick={connect}>
        Connect
      </button>

      <div>
        <h2 className="Profile">Recommended Profiles</h2>
        {profiles.map((profile, index) => (
          <div key={index}>
            <h3 className="Profile">
              {++index}
              {`:  `}
              {profile.name}
            </h3>
            <p className="Profile">
              {`handle:  `}
              {profile.handle}
            </p>
            <p className="Profile">
              {`bio:  `}
              {profile.bio}
            </p>
            {profile.picture ? (
              <img className="Image" src={profile.picture.original.url} />
            ) : (
              <img className="Image" src="../public/image.jpg" />
            )}
          </div>
        ))}
      </div>
      {successMessage()}
      {errorMessage()}
      <p className="App-text">Create a Profile</p>
      <div>
        <label htmlFor="username" className="App-label">
          Name
        </label>
        <input
          className="form-item"
          type="text"
          name="username"
          id="username"
          placeholder="username"
          autoFocus
          onChange={handleChange("username")}
          value={username}
        />
      </div>

      <div>
        <label htmlFor="handle" className="App-label">
          Handle
        </label>
        <input
          className="form-item"
          type="text"
          name="handle"
          id="handle"
          placeholder="handle"
          autoFocus
          onChange={handleChange("handle")}
          value={handle}
        />
      </div>

      <div>
        <label htmlFor="bio" className="App-label">
          Bio
        </label>
        <textarea
          className="form-item"
          name="bio"
          id="bio"
          placeholder="enter bio"
          autoFocus
          onChange={handleChange("bio")}
          value={bio}
        />
      </div>

      <div>
        <label htmlFor="profilePic" className="App-label">
          Profile pic
        </label>
        <input
          className="form-item"
          type="file"
          name="profilePic"
          id="profilePic"
          accept="image"
          placeholder="upload profile pic"
          autoFocus
          onChange={handleChange("profilePic")}
        />
      </div>

      <div>
        <button className="thm-btn" onClick={makeProfile}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default App;
