import ForgeUI, { render, Fragment, Macro, Text, useProductContext, useState } from "@forge/ui";
import api, { route, storage } from "@forge/api";


const fetchPage = async (contentId) => {
  const response = await api.asUser().requestConfluence(route`/wiki/api/v2/pages/${contentId}`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  const data = await response.json();
  return data;
}

const storageKey = "page-ring";

const isPageIDStored = async (pageID) => {
  var arrPageRing = await storage.get(storageKey);
  if (arrPageRing) {
    return arrPageRing.indexOf(pageID);
  } else {
    return -1;
  }
}

const storePageID = async (pageID) => {
  var arrPageRing = await storage.get(storageKey);

  if (!arrPageRing) {
    arrPageRing = [];
  }

  arrPageRing.push(pageID);
  await storage.set(storageKey, arrPageRing);
  return arrPageRing.indexOf(pageID)
}

const getAdjacentPageID = async (pageIDindex, direction) => {
  var arrPageRing = await storage.get(storageKey);
  var arrayLength = arrPageRing.length;
  if (direction == 1) { // next
    // if page is at the end of the array
    if (pageIDindex +1 == arrayLength) {
      return arrPageRing[0]
    } else {
      return arrPageRing[pageIDindex+1];
    }
  } else { // previous
    // if page is at the begining of the array
    if (pageIDindex == 0) {
      return arrPageRing[arrayLength-1]
    } else {
      return arrPageRing[pageIDindex-1];
    }
  }
}

const App = () => {
  const context = useProductContext();
  console.log("context: " + JSON.stringify(context));
  console.log("context.contentId: " + context.contentId);

  const pageID = context.contentId;
  var pageIDindex = useState(async () => await isPageIDStored(pageID))[0];

  if (pageIDindex < 0) {
    pageIDindex = useState(async () => await storePageID(pageID))[0];
  }

  const [prevID] = useState(async () => await getAdjacentPageID(pageIDindex, -1));
  const [prevPage] = useState(async () => await fetchPage(prevID));

  const [nextID] = useState(async () => await getAdjacentPageID(pageIDindex, 1));
  const [nextPage] = useState(async () => await fetchPage(nextID));

  const [currPage] = useState(async () => await fetchPage(pageID))

  return (
    <Fragment>
      <Text>Previous Page: {prevPage.title}</Text>
      <Text>Current Page: {currPage.title}</Text>
      <Text>Next Page: {nextPage.title}</Text>
    </Fragment>
  );
};

export const run = render(
  <Macro
    app={<App />}
  />
);
