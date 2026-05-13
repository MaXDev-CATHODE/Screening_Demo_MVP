import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function unauthorized(message = "Demo session is required.") {
  return NextResponse.json({ message }, { status: 401 });
}

export function forbidden(message = "Current role cannot perform this action.") {
  return NextResponse.json({ message }, { status: 403 });
}

export function notFound(message = "Resource not found.") {
  return NextResponse.json({ message }, { status: 404 });
}
