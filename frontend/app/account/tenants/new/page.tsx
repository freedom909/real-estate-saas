//frontend/app/account/tenants/new/page.tsx


"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";

import { CREATE_TENANT } from "../../../graphql/tenant/queries/tenant";
import {
  getAvailableTenants,
  switchTenant,
} from "../../../services/tenant.service";
import { useTenantStore } from "../../../store/tenant.store";
import AccountLayout from "../../../components/account/AccountLayout";
import Link from "next/link";

interface CreateTenantResult {
  createTenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
}

interface CreateTenantVariables {
  input: {
    name: string;
    slug: string;
  };
}

function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewTenantPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);

  const setAvailableTenants = useTenantStore(
    (state) => state.setAvailableTenants
  );
  const setActiveTenant = useTenantStore(
    (state) => state.setActiveTenant
  );

  const [createTenant, { loading }] = useMutation<
    CreateTenantResult,
    CreateTenantVariables
  >(CREATE_TENANT);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");

    const trimmedName = name.trim();
    const finalSlug = slug.trim() || createSlug(trimmedName);

    if (!trimmedName) {
      setErrorMessage("Tenant名を入力してください。");
      return;
    }

    if (!finalSlug) {
      setErrorMessage(
        "有効なslugを生成できません。英数字を使用するか、slugを手動で入力してください。"
      );
      return;
    }

    let createdTenant: CreateTenantResult["createTenant"];

    // ステップ1：Tenantを作成する。
    try {
      const result = await createTenant({
        variables: {
          input: {
            name: trimmedName,
            slug: finalSlug,
          },
        },
      });

      if (!result.data?.createTenant) {
        throw new Error("サーバーから新規Tenantの情報が返されませんでした。");
      }

      createdTenant = result.data.createTenant;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Tenantの作成に失敗しました。";

      setErrorMessage(message);
      return;
    }

    // ここから先、Tenantは作成済み。
    // 以降の処理が失敗しても createTenant を再実行してはならない。
    setIsSwitching(true);

    try {
      const tenants = await getAvailableTenants();
      setAvailableTenants(tenants);

      const availableTenant = tenants.find(
        (tenant) => tenant.id === createdTenant.id
      );

      if (!availableTenant) {
        setNotice(
        `Tenant「${createdTenant.name}」を作成しましたが、テナント一覧に見つかりませんでした。一覧を更新するか、Membershipをご確認ください。`
        );
        return;
      }

      const switched = await switchTenant(createdTenant.id);

      setAvailableTenants(tenants);
      setActiveTenant(switched.activeTenantId);

      router.push("/account");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "不明なエラー";

      setNotice(
        `Tenant「${createdTenant.name}」を作成しましたが、自動切り替えに失敗しました：${message}。重複作成せず、後でテナント一覧から切り替えてください。`
      );
    } finally {
      setIsSwitching(false);
    }
  }

  return (
    <AccountLayout>
      <div className="mx-auto w-full max-w-xl">
      {loading && (
        <div className="flex justify-center items-center">
          <div className="spinner-border text-gray-500" role="status" />
        </div>
      )}
      <h1 className="mb-2 text-2xl font-semibold">
    
        
        新規Tenantを作成
      </h1>

      <p className="mb-6 text-sm text-gray-600">
        新しいテナントスペースを作成します。作成者はこのTenantのOWNERになります。
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="tenant-name"
            className="mb-1 block text-sm font-medium"
          >
            Tenant名
          </label>

          <input
            id="tenant-name"
            value={name}
            onChange={(event) => {
              const value = event.target.value;
              setName(value);

              if (!slugManuallyEdited) {
                setSlug(createSlug(value));
              }
            }}
            required
            maxLength={100}
            placeholder="例：Osaka Guesthouse"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="tenant-slug"
            className="mb-1 block text-sm font-medium"
          >
            Slug（一意の識別子）
          </label>

          <input
            id="tenant-slug"
            value={slug}
            onChange={(event) => {
              setSlugManuallyEdited(true);
              setSlug(createSlug(event.target.value));
            }}
            required
            maxLength={100}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="osaka-guesthouse"
            className="w-full rounded-md border px-3 py-2"
          />

          <p className="mt-1 text-xs text-gray-500">
            小文字の英数字とハイフンのみ使用可能です。一意である必要があります。
          </p>
        </div>

        {errorMessage && (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-md border p-3 text-sm"
          >
            {notice}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || isSwitching}
            className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading
              ? "作成中..."
              : isSwitching
                ? "Tenantを切り替え中..."
                : "Tenantを作成"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/account")}
            disabled={loading || isSwitching}
            className="rounded-md border px-4 py-2 disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>
      </form>
      </div>
    </AccountLayout>
  );
}
