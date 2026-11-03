import type { SupabaseClient } from "@supabase/supabase-js";

type ToolInput = Record<string, unknown>;

type ToolName = "list_sites" | "check_site" | "create_task";

export const tools = [
  {
    name: "list_sites",
    description: "List all monitored sites.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "check_site",
    description: "Check whether a site is reachable and measure its response time.",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to check.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "create_task",
    description: "Create a maintenance task for a site.",
    input_schema: {
      type: "object",
      properties: {
        site_id: {
          type: "string",
          description: "The ID of the site associated with the task.",
        },
        title: {
          type: "string",
          description: "The task title.",
        },
      },
      required: ["site_id", "title"],
    },
  },
] as const;

export async function runTool(name: string, input: ToolInput, supabase: SupabaseClient) {
  switch (name as ToolName) {
    case "list_sites": {
      const { data, error } = await supabase.from("sites").select("*");
      if (error) throw error;
      return data;
    }

    case "check_site": {
      const started = Date.now();
      try {
        const response = await fetch(String(input.url), {
          signal: AbortSignal.timeout(8000),
        });
        return {
          up: response.ok,
          status: response.status,
          ms: Date.now() - started,
        };
      } catch {
        return { up: false, status: null, ms: null };
      }
    }

    case "create_task": {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          id: crypto.randomUUID(),
          site_id: input.site_id,
          title: input.title,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
