// get value from cara_pulang.json on public with passing label 
export async function getCaraPulangByLabel(label: string) {
  const data = await fetch('/cara_pulang.json').then((res) => res.json());

  const result = data.find((item: any) => item.label === label);
  return result ? result : { value: null, label: null };
} 