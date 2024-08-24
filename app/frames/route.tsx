import { Button } from "frames.js/next";
import { frames } from "./frames";
import { appURL, formatNumber } from "../utils";

interface State {
  lastFid?: string;
}

interface MoxieData {
  today: { allEarningsAmount: string };
  weekly: { allEarningsAmount: string };
  lifetime: { allEarningsAmount: string };
}

const frameHandler = frames(async (ctx) => {
  interface UserData {
    name: string;
    username: string;
    fid: string;
    socialCapitalScore: string;
    socialCapitalRank: string;
    profileDisplayName: string;
    isPowerUser: boolean;
    profileImageUrl: string;
  }

  let userData: UserData | null = null;
  let moxieData: MoxieData | null = null;

  let error: string | null = null;
  let isLoading = false;

  const fetchUserData = async (fid: string) => {
    isLoading = true;
    try {
      const airstackUrl = `${appURL()}/api/farscore?userId=${encodeURIComponent(
        fid
      )}`;
      const airstackResponse = await fetch(airstackUrl);
      if (!airstackResponse.ok) {
        throw new Error(
          `Airstack HTTP error! status: ${airstackResponse.status}`
        );
      }
      const airstackData = await airstackResponse.json();

      if (
        airstackData.userData.Socials.Social &&
        airstackData.userData.Socials.Social.length > 0
      ) {
        const social = airstackData.userData.Socials.Social[0];
        userData = {
          name: social.profileDisplayName || social.profileName || "Unknown",
          username: social.profileName || "unknown",
          fid: social.userId || "N/A",
          profileDisplayName: social.profileDisplayName || "N/A",
          socialCapitalScore:
            social.socialCapital?.socialCapitalScore?.toFixed(2) || "N/A",
          socialCapitalRank: social.socialCapital?.socialCapitalRank || "N/A",
          isPowerUser: social.isFarcasterPowerUser || false,
          profileImageUrl:
            social.profileImageContentValue?.image?.extraSmall ||
            social.profileImage ||
            "",
        };
      } else {
        throw new Error("No user data found");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      error = (err as Error).message;
    } finally {
      isLoading = false;
    }
  };

  const fetchMoxieData = async (fid: string) => {
    try {
      const moxieUrl = `${appURL()}/api/moxie-earnings?entityId=${encodeURIComponent(
        fid
      )}`;
      const moxieResponse = await fetch(moxieUrl);
      if (!moxieResponse.ok) {
        throw new Error(`Moxie HTTP error! status: ${moxieResponse.status}`);
      }
      moxieData = await moxieResponse.json();
    } catch (err) {
      console.error("Error fetching Moxie data:", err);
      error = (err as Error).message;
    }
  };

  const extractFid = (url: string): string | null => {
    try {
      const parsedUrl = new URL(url);
      let fid = parsedUrl.searchParams.get("userfid");

      console.log("Extracted FID from URL:", fid);
      return fid;
    } catch (e) {
      console.error("Error parsing URL:", e);
      return null;
    }
  };

  let fid: string | null = null;

  if (ctx.message?.requesterFid) {
    fid = ctx.message.requesterFid.toString();
    console.log("Using requester FID:", fid);
  } else if (ctx.url) {
    fid = extractFid(ctx.url.toString());
    console.log("Extracted FID from URL:", fid);
  } else {
    console.log("No ctx.url available");
  }

  if (!fid && (ctx.state as State)?.lastFid) {
    fid = (ctx.state as State).lastFid ?? null;
    console.log("Using FID from state:", fid);
  }

  console.log("Final FID used:", fid);

  const shouldFetchData =
    fid && (!userData || (userData as UserData).fid !== fid);

  if (shouldFetchData && fid) {
    await Promise.all([fetchUserData(fid), fetchMoxieData(fid)]);
  }

  const currentPrice = (await fetch('https://min-api.cryptocompare.com/data/price?fsym=moxie&tsyms=USD&api_key=74c2420d0604b21b86078dd9728d2a7d1f5c4e217d98bed490a98ce0bef2b70c'));
  const moxiePrice = await currentPrice.json();
  const moxiePriceUSD = parseFloat(moxiePrice.USD);

  const SplashScreen = () => (
    <img
      src="https://i.ibb.co/4gyQNMq/moxie-reward.png"
      tw="w-full h-full object-cover"
    />
  );

  const ScoreScreen = () => {
    return (
      <div tw="flex flex-col w-full h-full relative">
        <img
            src="https://i.imgur.com/vY4GUor.png"
            tw="h-full w-full"
        />
        <img
          src={userData?.profileImageUrl}
          alt="Profile"
          tw="w-20 h-20 rounded-3 absolute top-50 left-24"
        />
        <div tw="flex text-3xl absolute top-51 left-47 text-white">{userData?.profileDisplayName}</div>
        <div tw="flex text-2xl absolute top-59 left-47 text-white">@{userData?.username}</div>
        <div tw="flex text-[42px] absolute bottom-20 left-37 text-[#ffeb5b]">#{userData?.socialCapitalRank}</div>
        <div tw="flex text-[42px] absolute bottom-47 left-37 text-[#ffeb5b]">{userData?.socialCapitalScore}</div>
        <div tw="flex text-[42px] w-2/4 absolute bottom-62 left-118 text-[#ffeb5b]">{userData?.socialCapitalScore}</div>
        <div tw="flex text-[42px] justify-center w-2/4 absolute bottom-62 left-118 text-[#ffeb5b]">{(Number(userData?.socialCapitalScore) * 5).toFixed(2)}</div>
        <div tw="flex text-[42px] justify-end w-2/4 absolute bottom-62 left-118 text-[#ffeb5b]">{(Number(userData?.socialCapitalScore) * 10).toFixed(2)}</div>
        <div tw="flex text-[42px] w-2/4 absolute bottom-15 left-118 text-[#ffeb5b]">{formatNumber(parseFloat(moxieData?.today.allEarningsAmount || "0"))}</div>
        <div tw="flex text-[42px] justify-center w-2/4 absolute bottom-15 left-118 text-[#ffeb5b]">{formatNumber(parseFloat(moxieData?.weekly.allEarningsAmount || "0"))}</div>
        <div tw="flex text-[42px] justify-end w-2/4 absolute bottom-15 left-118 text-[#ffeb5b]">{formatNumber(parseFloat(moxieData?.lifetime.allEarningsAmount || "0"))}</div>
        <div tw="flex text-[39px] w-2/4 absolute bottom-2 left-118 text-[#ffeb5b]">${formatNumber(parseFloat(moxieData?.today.allEarningsAmount || "0") * moxiePriceUSD)}</div>
        <div tw="flex text-[39px] justify-center w-2/4 absolute bottom-2 left-118 text-[#ffeb5b]">${formatNumber(parseFloat(moxieData?.weekly.allEarningsAmount || "0") * moxiePriceUSD)}</div>
        <div tw="flex text-[39px] justify-end w-2/4 absolute bottom-2 left-118 text-[#ffeb5b]">${formatNumber(parseFloat(moxieData?.lifetime.allEarningsAmount || "0") * moxiePriceUSD)}</div>
        <div tw="flex text-[33px] justify-start w-full absolute bottom-1 left-44 text-[#ffeb5b]">${moxiePriceUSD}</div>
    </div>
    );
  };
  const shareText = encodeURIComponent(
    userData
      ? `Check your MOXIE STATS!!! Frame created by @tieubochet.eth`
      : "Check your MOXIE STATS!!! Frame created by @tieubochet.eth"
  );

  // Change the url here
  const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=https://check-moxie-stats-v1.vercel.app/frames${
    fid ? `?userfid=${fid}` : ""
  }`;

  const buttons = [];

  if (!userData) {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check your
      </Button>
    );
  } else {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check your
      </Button>,
      <Button action="link" target={shareUrl}>
        Share
      </Button>
    );
  }

  return {
    image: fid && !error ? <ScoreScreen /> : <SplashScreen />,
    buttons: buttons,
  };
});

export const GET = frameHandler;
export const POST = frameHandler;
