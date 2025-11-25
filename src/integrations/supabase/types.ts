export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          empresa_id: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          new_value: Json | null
          previous_value: Json | null
          timestamp: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          empresa_id?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          timestamp?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          empresa_id?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          new_value?: Json | null
          previous_value?: Json | null
          timestamp?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      bancos: {
        Row: {
          ativo: boolean | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          empresa_id: string | null
          id: string
          nome: string | null
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bancos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean | null
          cpf: string | null
          created_at: string | null
          email: string | null
          empresa_id: string | null
          id: string
          nome: string | null
        }
        Insert: {
          ativo?: boolean | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string | null
        }
        Update: {
          ativo?: boolean | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes: {
        Row: {
          contrato_id: string | null
          created_at: string | null
          data_previsao: string | null
          data_recebimento: string | null
          empresa_id: string | null
          id: string
          observacao: string | null
          percentual_comissao: number | null
          proposta_id: string
          status_recebimento: string | null
          updated_at: string | null
          usuario_id: string | null
          valor_comissao: number
        }
        Insert: {
          contrato_id?: string | null
          created_at?: string | null
          data_previsao?: string | null
          data_recebimento?: string | null
          empresa_id?: string | null
          id?: string
          observacao?: string | null
          percentual_comissao?: number | null
          proposta_id: string
          status_recebimento?: string | null
          updated_at?: string | null
          usuario_id?: string | null
          valor_comissao: number
        }
        Update: {
          contrato_id?: string | null
          created_at?: string | null
          data_previsao?: string | null
          data_recebimento?: string | null
          empresa_id?: string | null
          id?: string
          observacao?: string | null
          percentual_comissao?: number | null
          proposta_id?: string
          status_recebimento?: string | null
          updated_at?: string | null
          usuario_id?: string | null
          valor_comissao?: number
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_apolices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_apolices: {
        Row: {
          created_at: string | null
          data_inicio: string | null
          data_vigencia_fim: string | null
          detalhes_produto: Json | null
          empresa_id: string | null
          id: string
          numero_apolice: string | null
          numero_contrato: string | null
          proposta_id: string
          status_contrato: string | null
          status_cota: string | null
          tipo_proposta:
            | Database["public"]["Enums"]["tipo_proposta_enum"]
            | null
          updated_at: string | null
          usuario_id: string | null
          valor_contrato: number | null
        }
        Insert: {
          created_at?: string | null
          data_inicio?: string | null
          data_vigencia_fim?: string | null
          detalhes_produto?: Json | null
          empresa_id?: string | null
          id?: string
          numero_apolice?: string | null
          numero_contrato?: string | null
          proposta_id: string
          status_contrato?: string | null
          status_cota?: string | null
          tipo_proposta?:
            | Database["public"]["Enums"]["tipo_proposta_enum"]
            | null
          updated_at?: string | null
          usuario_id?: string | null
          valor_contrato?: number | null
        }
        Update: {
          created_at?: string | null
          data_inicio?: string | null
          data_vigencia_fim?: string | null
          detalhes_produto?: Json | null
          empresa_id?: string | null
          id?: string
          numero_apolice?: string | null
          numero_contrato?: string | null
          proposta_id?: string
          status_contrato?: string | null
          status_cota?: string | null
          tipo_proposta?:
            | Database["public"]["Enums"]["tipo_proposta_enum"]
            | null
          updated_at?: string | null
          usuario_id?: string | null
          valor_contrato?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_apolices_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_apolices_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      conversas: {
        Row: {
          created_at: string | null
          empresa_id: string
          id: string
          is_starred: boolean | null
          nome: string
          origem: string | null
          status: string | null
          telefone: string
          ultima_data: string | null
          ultimo_texto: string | null
          unread: number | null
          updated_at: string | null
          whatsapp_instance_id: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_id: string
          id?: string
          is_starred?: boolean | null
          nome: string
          origem?: string | null
          status?: string | null
          telefone: string
          ultima_data?: string | null
          ultimo_texto?: string | null
          unread?: number | null
          updated_at?: string | null
          whatsapp_instance_id?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string
          id?: string
          is_starred?: boolean | null
          nome?: string
          origem?: string | null
          status?: string | null
          telefone?: string
          ultima_data?: string | null
          ultimo_texto?: string | null
          unread?: number | null
          updated_at?: string | null
          whatsapp_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_whatsapp_instance_id_fkey"
            columns: ["whatsapp_instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          conversa_id: string
          created_at: string | null
          data: string | null
          empresa_id: string
          evolution_message_id: string | null
          evolution_timestamp: number | null
          id: string
          media_url: string | null
          mensagem: string
          sender_name: string | null
          sender_phone: string | null
          status: string | null
          tipo: string
        }
        Insert: {
          conversa_id: string
          created_at?: string | null
          data?: string | null
          empresa_id: string
          evolution_message_id?: string | null
          evolution_timestamp?: number | null
          id?: string
          media_url?: string | null
          mensagem: string
          sender_name?: string | null
          sender_phone?: string | null
          status?: string | null
          tipo: string
        }
        Update: {
          conversa_id?: string
          created_at?: string | null
          data?: string | null
          empresa_id?: string
          evolution_message_id?: string | null
          evolution_timestamp?: number | null
          id?: string
          media_url?: string | null
          mensagem?: string
          sender_name?: string | null
          sender_phone?: string | null
          status?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          banco_id: string | null
          created_at: string | null
          empresa_id: string | null
          id: string
          nome: string | null
          status: string | null
          taxa_juros: number | null
          tipo_credito: string | null
        }
        Insert: {
          ativo?: boolean | null
          banco_id?: string | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string | null
          status?: string | null
          taxa_juros?: number | null
          tipo_credito?: string | null
        }
        Update: {
          ativo?: boolean | null
          banco_id?: string | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string | null
          status?: string | null
          taxa_juros?: number | null
          tipo_credito?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_banco_id_fkey"
            columns: ["banco_id"]
            isOneToOne: false
            referencedRelation: "bancos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          empresa_id: string
          id: string
          nome: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          empresa_id: string
          id: string
          nome?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          empresa_id?: string
          id?: string
          nome?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      promotoras: {
        Row: {
          ativo: boolean | null
          banco_id: string | null
          comissao_padrao: number | null
          contato: string | null
          created_at: string | null
          email: string | null
          empresa_id: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          banco_id?: string | null
          comissao_padrao?: number | null
          contato?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          banco_id?: string | null
          comissao_padrao?: number | null
          contato?: string | null
          created_at?: string | null
          email?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotoras_banco_id_fkey"
            columns: ["banco_id"]
            isOneToOne: false
            referencedRelation: "bancos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotoras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      proposta_anexos: {
        Row: {
          created_at: string | null
          empresa_id: string | null
          id: string
          nome_arquivo: string
          proposta_id: string
          tamanho_bytes: number | null
          tipo_arquivo: string | null
          url_arquivo: string
          usuario_id: string | null
          usuario_nome: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome_arquivo: string
          proposta_id: string
          tamanho_bytes?: number | null
          tipo_arquivo?: string | null
          url_arquivo: string
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome_arquivo?: string
          proposta_id?: string
          tamanho_bytes?: number | null
          tipo_arquivo?: string | null
          url_arquivo?: string
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposta_anexos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_anexos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      proposta_atividades: {
        Row: {
          created_at: string | null
          data_agendamento: string | null
          data_atividade: string | null
          descricao: string
          empresa_id: string | null
          id: string
          proposta_id: string
          status: string | null
          tipo_atividade: string
          usuario_id: string | null
          usuario_nome: string | null
        }
        Insert: {
          created_at?: string | null
          data_agendamento?: string | null
          data_atividade?: string | null
          descricao: string
          empresa_id?: string | null
          id?: string
          proposta_id: string
          status?: string | null
          tipo_atividade: string
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Update: {
          created_at?: string | null
          data_agendamento?: string | null
          data_atividade?: string | null
          descricao?: string
          empresa_id?: string | null
          id?: string
          proposta_id?: string
          status?: string | null
          tipo_atividade?: string
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposta_atividades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_atividades_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      proposta_documentos: {
        Row: {
          created_at: string | null
          data_recebimento: string | null
          empresa_id: string | null
          id: string
          nome_documento: string
          obrigatorio: boolean | null
          observacao: string | null
          proposta_id: string
          status_documento: string | null
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_recebimento?: string | null
          empresa_id?: string | null
          id?: string
          nome_documento: string
          obrigatorio?: boolean | null
          observacao?: string | null
          proposta_id: string
          status_documento?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_recebimento?: string | null
          empresa_id?: string | null
          id?: string
          nome_documento?: string
          obrigatorio?: boolean | null
          observacao?: string | null
          proposta_id?: string
          status_documento?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposta_documentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_documentos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      proposta_historico: {
        Row: {
          created_at: string | null
          empresa_id: string | null
          id: string
          observacao: string | null
          proposta_id: string
          status_anterior: string | null
          status_novo: string
          usuario_id: string | null
          usuario_nome: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          observacao?: string | null
          proposta_id: string
          status_anterior?: string | null
          status_novo: string
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          observacao?: string | null
          proposta_id?: string
          status_anterior?: string | null
          status_novo?: string
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposta_historico_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_historico_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          banco_id: string | null
          cliente_id: string | null
          data: string | null
          detalhes_produto: Json | null
          empresa_id: string | null
          finalidade: string | null
          id: string
          observacoes: string | null
          produto_id: string | null
          status: string | null
          tipo_proposta: Database["public"]["Enums"]["tipo_proposta_enum"]
          usuario_id: string | null
          valor: number | null
        }
        Insert: {
          banco_id?: string | null
          cliente_id?: string | null
          data?: string | null
          detalhes_produto?: Json | null
          empresa_id?: string | null
          finalidade?: string | null
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          status?: string | null
          tipo_proposta?: Database["public"]["Enums"]["tipo_proposta_enum"]
          usuario_id?: string | null
          valor?: number | null
        }
        Update: {
          banco_id?: string | null
          cliente_id?: string | null
          data?: string | null
          detalhes_produto?: Json | null
          empresa_id?: string | null
          finalidade?: string | null
          id?: string
          observacoes?: string | null
          produto_id?: string | null
          status?: string | null
          tipo_proposta?: Database["public"]["Enums"]["tipo_proposta_enum"]
          usuario_id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_banco_id_fkey"
            columns: ["banco_id"]
            isOneToOne: false
            referencedRelation: "bancos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          empresa_id: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          empresa_id: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          empresa_id?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          always_online: boolean | null
          api_key: string
          connected_at: string | null
          created_at: string | null
          empresa_id: string
          groups_ignore: boolean | null
          id: string
          instance_id: string
          instance_name: string
          integration_type: string | null
          phone_number: string | null
          qr_code_expires_at: string | null
          qr_code_url: string | null
          read_messages: boolean | null
          reject_calls: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          always_online?: boolean | null
          api_key: string
          connected_at?: string | null
          created_at?: string | null
          empresa_id: string
          groups_ignore?: boolean | null
          id?: string
          instance_id: string
          instance_name: string
          integration_type?: string | null
          phone_number?: string | null
          qr_code_expires_at?: string | null
          qr_code_url?: string | null
          read_messages?: boolean | null
          reject_calls?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          always_online?: boolean | null
          api_key?: string
          connected_at?: string | null
          created_at?: string | null
          empresa_id?: string
          groups_ignore?: boolean | null
          id?: string
          instance_id?: string
          instance_name?: string
          integration_type?: string | null
          phone_number?: string | null
          qr_code_expires_at?: string | null
          qr_code_url?: string | null
          read_messages?: boolean | null
          reject_calls?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      configure_test_user_as_admin: { Args: never; Returns: undefined }
      create_initial_admin_user: { Args: never; Returns: undefined }
      get_dashboard_kpis: { Args: { _empresa_id: string }; Returns: Json }
      get_default_empresa_for_signup: { Args: never; Returns: string }
      get_monthly_proposta_trends: {
        Args: { _empresa_id: string }
        Returns: {
          avg_valor: number
          count: number
          month: string
          total_valor: number
        }[]
      }
      get_proposta_status_breakdown: {
        Args: { _empresa_id: string }
        Returns: {
          avg_valor: number
          count: number
          percentage: number
          status: string
          total_valor: number
        }[]
      }
      get_recent_propostas: {
        Args: { _empresa_id: string; _limit?: number }
        Returns: {
          banco_nome: string
          cliente_nome: string
          data: string
          id: string
          produto_nome: string
          status: string
          valor: number
        }[]
      }
      get_top_bancos: {
        Args: { _empresa_id: string; _limit?: number }
        Returns: {
          banco_id: string
          banco_nome: string
          count: number
          total_valor: number
        }[]
      }
      get_top_produtos: {
        Args: { _empresa_id: string; _limit?: number }
        Returns: {
          count: number
          produto_id: string
          produto_nome: string
          total_valor: number
        }[]
      }
      get_user_empresa_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_activity: {
        Args: {
          _action: string
          _details?: Json
          _entity_id: string
          _entity_name: string
          _entity_type: string
          _new_value?: Json
          _previous_value?: Json
          _user_id: string
        }
        Returns: string
      }
      log_auth_event: {
        Args: {
          _action: string
          _user_email?: string
          _user_id: string
          _user_name?: string
        }
        Returns: string
      }
      user_in_empresa: {
        Args: { _empresa_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "gerente" | "agente"
      tipo_proposta_enum: "credito" | "consorcio" | "seguro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gerente", "agente"],
      tipo_proposta_enum: ["credito", "consorcio", "seguro"],
    },
  },
} as const
