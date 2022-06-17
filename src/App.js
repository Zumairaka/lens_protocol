import "./App.css";
import React, { useState, useEffect } from "react";
import { urqlClient, fetchProfiles } from "./api";
import ABI from "./abi.json";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { Buffer } from 'buffer';

const address = "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";
const client = create("https://ipfs.infura.io:5001/api/v0");
let photo;
let accounts;
let url;

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
  // const [url, setUrl] = useState("");
  const [view, setView] = useState(false);

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

  const connect = async () => {
    if (window.ethereum) {
      accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts);
    } else {
      setError("install metamask extension..");
    }
  }

  // creating profile and wallet connect
  const makeProfile = async () => {
    try {

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      console.log("provider: ", provider);
      console.log("signer", signer);
      console.log("url in", url);
      const contract = new ethers.Contract(address, ABI, signer);

      const zero_address = ethers.constants.AddressZero;

      const profileRequest = {
        to: signer._address,
        handle: handle,
        imageURI: url,
        followModule: "0x00",
        followModuleData: "",
        followNFTURI: "",
      };
      console.log("create data:", profileRequest);
      const tx = await contract.connect(signer).createProfile(profileRequest);
      await tx.wait();
      console.log("tx", tx);
      console.log("created profile successfully");
      console.log("accounts", accounts);

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

  // handle change function
  const handleChange = (name) => async (event) => {
    setError(false);
    event.preventDefault();


    if (name === "profilePic") {
      photo = event.target.files[0];
      try {
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(photo);
        reader.onloadend = async () => {
          console.log("Buffer data", Buffer(reader.result));
          photo = Buffer(reader.result);

          // submit to ipfs
          const created = await client.add(photo);
          const ipfsUrl = `https://ipfs.infura.io/ipfs/${created.path}`;
          url = ipfsUrl;
          console.log("url", ipfsUrl);
        };
      } catch (err) {
        console.log(err.message);
      }
    } else {
      const value = event.target.value;
      setValues({ ...values, [name]: value });
    }

    // convert the file

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
      <button className="thm-btn" onClick={connect}>Connect Wallet</button>
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
      <button className="thm-btn" onClick={makeProfile}>
        Submit
      </button>
    </div>
  );
}

export default App;
