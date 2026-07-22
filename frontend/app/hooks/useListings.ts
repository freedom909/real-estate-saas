// src/wisdom-web/app/hooks/useListings.ts
import { listingService } from "../services/listing.service";
import { api } from "../lib/apolloClient";
import { Button } from "@/components/Button";
import { toast } from "@/components/Toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useQuery } from "@tanstack/react-query";


export const useListings = () => {
  return useQuery({
    queryKey: ["listings"],
    queryFn: listingService.getAll,
  });
};



export const useCreateListing = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: listingService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
};