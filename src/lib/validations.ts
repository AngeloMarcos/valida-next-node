import * as yup from "yup";

// Configuração global de mensagens de erro em português
yup.setLocale({
  mixed: {
    default: "Campo inválido",
    required: "Este campo é obrigatório",
    notType: "Formato inválido",
  },
  string: {
    min: ({ min }) => `Deve ter no mínimo ${min} caracteres`,
    max: ({ max }) => `Deve ter no máximo ${max} caracteres`,
    email: "E-mail inválido",
    url: "URL inválida",
  },
  number: {
    min: ({ min }) => `Deve ser no mínimo ${min}`,
    max: ({ max }) => `Deve ser no máximo ${max}`,
    positive: "Deve ser um número positivo",
    negative: "Deve ser um número negativo",
    integer: "Deve ser um número inteiro",
  },
  date: {
    min: ({ min }) => `Deve ser posterior a ${min}`,
    max: ({ max }) => `Deve ser anterior a ${max}`,
  },
  boolean: {},
  object: {},
  array: {
    min: ({ min }) => `Deve ter no mínimo ${min} itens`,
    max: ({ max }) => `Deve ter no máximo ${max} itens`,
  },
});

// Validações customizadas reutilizáveis
export const customValidations = {
  // CPF
  cpf: yup
    .string()
    .test("cpf", "CPF inválido", (value) => {
      if (!value) return false;
      const cpf = value.replace(/\D/g, "");
      if (cpf.length !== 11) return false;
      // Validação básica de CPF
      if (/^(\d)\1+$/.test(cpf)) return false;
      return true;
    }),

  // CNPJ
  cnpj: yup
    .string()
    .test("cnpj", "CNPJ inválido", (value) => {
      if (!value) return false;
      const cnpj = value.replace(/\D/g, "");
      if (cnpj.length !== 14) return false;
      // Validação básica de CNPJ
      if (/^(\d)\1+$/.test(cnpj)) return false;
      return true;
    }),

  // Telefone brasileiro
  phone: yup
    .string()
    .test("phone", "Telefone inválido", (value) => {
      if (!value) return false;
      const phone = value.replace(/\D/g, "");
      return phone.length >= 10 && phone.length <= 11;
    }),

  // CEP
  cep: yup
    .string()
    .test("cep", "CEP inválido", (value) => {
      if (!value) return false;
      const cep = value.replace(/\D/g, "");
      return cep.length === 8;
    }),

  // Moeda (valor monetário)
  currency: yup
    .string()
    .test("is-number", "Valor deve ser um número válido", (value) => {
      if (!value) return false;
      return !isNaN(Number(value));
    })
    .test("is-positive", "Valor deve ser maior que zero", (value) => {
      return Number(value) > 0;
    })
    .test("decimal-places", "Valor deve ter no máximo 2 casas decimais", (value) => {
      if (!value) return true;
      const parts = value.split(".");
      return parts.length === 1 || parts[1].length <= 2;
    }),

  // Porcentagem
  percentage: yup
    .string()
    .test("is-number", "Porcentagem deve ser um número válido", (value) => {
      if (!value) return false;
      return !isNaN(Number(value));
    })
    .test("in-range", "Porcentagem deve estar entre 0 e 100", (value) => {
      const num = Number(value);
      return num >= 0 && num <= 100;
    }),

  // URL
  url: yup.string().url("URL inválida"),

  // E-mail
  email: yup
    .string()
    .email("E-mail inválido")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Formato de e-mail inválido"
    ),
};

// Schemas comuns para reutilização
export const commonSchemas = {
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),

  email: customValidations.email.required("E-mail é obrigatório"),

  phone: customValidations.phone.required("Telefone é obrigatório"),

  document: yup
    .string()
    .required("Documento é obrigatório")
    .test("cpf-or-cnpj", "CPF ou CNPJ inválido", (value) => {
      if (!value) return false;
      const doc = value.replace(/\D/g, "");
      return doc.length === 11 || doc.length === 14;
    }),

  password: yup
    .string()
    .required("Senha é obrigatória")
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .matches(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .matches(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .matches(/[0-9]/, "Senha deve conter pelo menos um número")
    .matches(/[@$!%*?&#]/, "Senha deve conter pelo menos um caractere especial"),

  confirmPassword: (passwordField: string = "password") =>
    yup
      .string()
      .required("Confirmação de senha é obrigatória")
      .test("passwords-match", "As senhas não coincidem", function (value) {
        return this.parent[passwordField] === value;
      }),

  date: yup
    .date()
    .typeError("Data inválida")
    .required("Data é obrigatória"),

  futureDate: yup
    .date()
    .typeError("Data inválida")
    .required("Data é obrigatória")
    .min(new Date(), "Data deve ser futura"),

  pastDate: yup
    .date()
    .typeError("Data inválida")
    .required("Data é obrigatória")
    .max(new Date(), "Data deve ser passada"),
};

export default yup;
