import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

//config for how the navigation behaves
export const getRouter = () => {
  const queryClient = new QueryClient(); //cache to avoid refetching

  const router = createRouter({
    routeTree, //includes all routes in the app
    context: { queryClient },
    scrollRestoration: true, //return to prev scroll position when navigating back
    defaultPreloadStaleTime: 0,
  });

  return router;
};
